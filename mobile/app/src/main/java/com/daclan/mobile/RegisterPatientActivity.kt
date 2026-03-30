package com.daclan.mobile

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.network.RegisterRequest
import com.daclan.mobile.network.RetrofitClient
import kotlinx.coroutines.launch
import java.util.Calendar

class RegisterPatientActivity : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var etDob: EditText
    private lateinit var spinnerGender: Spinner
    private lateinit var etAddress: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var btnBack: Button
    private lateinit var tvError: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_patient)

        etFirstName       = findViewById(R.id.etFirstName)
        etLastName        = findViewById(R.id.etLastName)
        etEmail           = findViewById(R.id.etEmail)
        etPhone           = findViewById(R.id.etPhone)
        etDob             = findViewById(R.id.etDob)
        spinnerGender     = findViewById(R.id.spinnerGender)
        etAddress         = findViewById(R.id.etAddress)
        etPassword        = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnRegister       = findViewById(R.id.btnRegister)
        btnBack           = findViewById(R.id.btnBack)
        tvError           = findViewById(R.id.tvError)

        // Gender spinner
        val genders = listOf("Select Gender", "MALE", "FEMALE", "OTHER")
        spinnerGender.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, genders)

        // Date picker
        etDob.setOnClickListener {
            val cal = Calendar.getInstance()
            DatePickerDialog(this, { _, y, m, d ->
                etDob.setText("$y-${(m+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}")
            }, cal.get(Calendar.YEAR) - 20, cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)).show()
        }

        btnBack.setOnClickListener { finish() }
        btnRegister.setOnClickListener { handleRegister() }
    }

    private fun handleRegister() {
        val firstName       = etFirstName.text.toString().trim()
        val lastName        = etLastName.text.toString().trim()
        val email           = etEmail.text.toString().trim()
        val phone           = etPhone.text.toString().trim()
        val dob             = etDob.text.toString().trim()
        val gender          = spinnerGender.selectedItem.toString()
        val address         = etAddress.text.toString().trim()
        val password        = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()

        when {
            firstName.isEmpty()     -> { showError("First name is required"); return }
            lastName.isEmpty()      -> { showError("Last name is required"); return }
            email.isEmpty()         -> { showError("Email is required"); return }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
            -> { showError("Enter a valid email address"); return }
            dob.isEmpty()           -> { showError("Date of birth is required"); return }
            gender == "Select Gender" -> { showError("Please select a gender"); return }
            address.isEmpty()       -> { showError("Address is required"); return }
            password.length < 8     -> { showError("Password must be at least 8 characters"); return }
            password != confirmPassword -> { showError("Passwords do not match"); return }
        }

        hideError()
        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.register(
                    RegisterRequest(
                        firstname    = firstName,
                        lastname     = lastName,
                        email        = email,
                        password     = password,
                        phoneNumber  = phone,
                        role         = "PATIENT",
                        googleVerified = true,
                        dateOfBirth  = dob,
                        gender       = gender,
                        address      = address
                    )
                )

                if (response.isSuccessful) {
                    val intent = Intent(this@RegisterPatientActivity, LoginActivity::class.java)
                    intent.putExtra("success_message", "Account created! You can now sign in.")
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                    finish()
                } else {
                    val msg = response.body()?.message
                        ?: when (response.code()) {
                            409  -> "Email is already registered"
                            400  -> "Invalid details. Please check your inputs."
                            else -> "Registration failed (${response.code()})"
                        }
                    showError(msg)
                }
            } catch (e: Exception) {
                showError("Connection error. Is your backend running?")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun showError(msg: String) { tvError.text = msg; tvError.visibility = View.VISIBLE }
    private fun hideError() { tvError.visibility = View.GONE }
    private fun setLoading(loading: Boolean) {
        btnRegister.isEnabled = !loading
        btnRegister.text = if (loading) "Creating Account…" else "Create Patient Account →"
    }
}