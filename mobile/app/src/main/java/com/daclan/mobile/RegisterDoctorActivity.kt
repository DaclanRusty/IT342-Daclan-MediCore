package com.daclan.mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.network.RegisterRequest
import com.daclan.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class RegisterDoctorActivity : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var spinnerSpec: Spinner
    private lateinit var etLicense: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var btnBack: Button
    private lateinit var tvError: TextView

    private val specializations = listOf(
        "Select Specialization","General Medicine","Cardiology","Dermatology",
        "Endocrinology","Gastroenterology","Neurology","Obstetrics & Gynecology",
        "Oncology","Ophthalmology","Orthopedics","Pediatrics","Psychiatry",
        "Pulmonology","Radiology","Surgery","Urology","Other"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_doctor)

        etFirstName       = findViewById(R.id.etFirstName)
        etLastName        = findViewById(R.id.etLastName)
        etEmail           = findViewById(R.id.etEmail)
        etPhone           = findViewById(R.id.etPhone)
        spinnerSpec       = findViewById(R.id.spinnerSpecialization)
        etLicense         = findViewById(R.id.etLicenseNumber)
        etPassword        = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnRegister       = findViewById(R.id.btnRegister)
        btnBack           = findViewById(R.id.btnBack)
        tvError           = findViewById(R.id.tvError)

        spinnerSpec.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, specializations)

        btnBack.setOnClickListener { finish() }
        btnRegister.setOnClickListener { handleRegister() }
    }

    private fun handleRegister() {
        val firstName       = etFirstName.text.toString().trim()
        val lastName        = etLastName.text.toString().trim()
        val email           = etEmail.text.toString().trim()
        val phone           = etPhone.text.toString().trim()
        val specialization  = spinnerSpec.selectedItem.toString()
        val license         = etLicense.text.toString().trim()
        val password        = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()

        when {
            firstName.isEmpty()  -> { showError("First name is required"); return }
            lastName.isEmpty()   -> { showError("Last name is required"); return }
            email.isEmpty()      -> { showError("Email is required"); return }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
            -> { showError("Enter a valid email address"); return }
            specialization == "Select Specialization" -> { showError("Please select a specialization"); return }
            license.isEmpty()    -> { showError("License number is required"); return }
            password.length < 8  -> { showError("Password must be at least 8 characters"); return }
            password != confirmPassword -> { showError("Passwords do not match"); return }
        }

        hideError()
        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.register(
                    RegisterRequest(
                        firstname      = firstName,
                        lastname       = lastName,
                        email          = email,
                        password       = password,
                        phoneNumber    = phone,
                        role           = "DOCTOR",
                        googleVerified = true,
                        specialization = specialization,
                        licenseNumber  = license
                    )
                )

                if (response.isSuccessful) {
                    val msg = response.body()?.data?.message
                        ?: "Registration submitted! Please wait for admin approval."
                    val intent = Intent(this@RegisterDoctorActivity, LoginActivity::class.java)
                    intent.putExtra("success_message", msg)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                    finish()
                } else {
                    val msg = response.body()?.message
                        ?: when (response.code()) {
                            409  -> "Email or license number already registered"
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
        btnRegister.text = if (loading) "Submitting…" else "Create Doctor Account →"
    }
}