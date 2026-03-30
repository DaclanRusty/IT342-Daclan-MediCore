package com.daclan.mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.network.AvailableDoctor
import com.daclan.mobile.network.RegisterRequest
import com.daclan.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class RegisterSecretaryActivity : AppCompatActivity() {

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var spinnerDoctor: Spinner
    private lateinit var tvDoctorLoading: TextView
    private lateinit var btnRegister: Button
    private lateinit var btnBack: Button
    private lateinit var tvError: TextView

    private var availableDoctors: List<AvailableDoctor> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_secretary)

        etFirstName       = findViewById(R.id.etFirstName)
        etLastName        = findViewById(R.id.etLastName)
        etEmail           = findViewById(R.id.etEmail)
        etPhone           = findViewById(R.id.etPhone)
        etPassword        = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        spinnerDoctor     = findViewById(R.id.spinnerDoctor)
        tvDoctorLoading   = findViewById(R.id.tvDoctorLoading)
        btnRegister       = findViewById(R.id.btnRegister)
        btnBack           = findViewById(R.id.btnBack)
        tvError           = findViewById(R.id.tvError)

        btnBack.setOnClickListener { finish() }
        btnRegister.setOnClickListener { handleRegister() }

        loadDoctors()
    }

    private fun loadDoctors() {
        tvDoctorLoading.text = "Loading available doctors..."
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getAvailableDoctors()
                if (response.isSuccessful) {
                    availableDoctors = response.body()?.data ?: emptyList()
                    val names = mutableListOf("Select a Doctor")
                    names.addAll(availableDoctors.map {
                        "Dr. ${it.firstname} ${it.lastname} — ${it.specialization}"
                    })
                    spinnerDoctor.adapter = ArrayAdapter(
                        this@RegisterSecretaryActivity,
                        android.R.layout.simple_spinner_dropdown_item,
                        names
                    )
                    tvDoctorLoading.text = if (availableDoctors.isEmpty())
                        "No available doctors at this time" else ""
                } else {
                    tvDoctorLoading.text = "Failed to load doctors"
                }
            } catch (e: Exception) {
                tvDoctorLoading.text = "Connection error loading doctors"
            }
        }
    }

    private fun handleRegister() {
        val firstName       = etFirstName.text.toString().trim()
        val lastName        = etLastName.text.toString().trim()
        val email           = etEmail.text.toString().trim()
        val phone           = etPhone.text.toString().trim()
        val password        = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()
        val doctorIndex     = spinnerDoctor.selectedItemPosition

        when {
            firstName.isEmpty()  -> { showError("First name is required"); return }
            lastName.isEmpty()   -> { showError("Last name is required"); return }
            email.isEmpty()      -> { showError("Email is required"); return }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
            -> { showError("Enter a valid email address"); return }
            password.length < 8  -> { showError("Password must be at least 8 characters"); return }
            password != confirmPassword -> { showError("Passwords do not match"); return }
            doctorIndex == 0 || availableDoctors.isEmpty()
            -> { showError("Please select a doctor"); return }
        }

        val selectedDoctor = availableDoctors[doctorIndex - 1]
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
                        role           = "SECRETARY",
                        googleVerified = true,
                        doctorId       = selectedDoctor.doctorId
                    )
                )

                if (response.isSuccessful) {
                    val msg = response.body()?.data?.message
                        ?: "Registration submitted! Please wait for the doctor to approve."
                    val intent = Intent(this@RegisterSecretaryActivity, LoginActivity::class.java)
                    intent.putExtra("success_message", msg)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                    finish()
                } else {
                    val msg = response.body()?.message
                        ?: when (response.code()) {
                            409  -> "Email already registered"
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
        btnRegister.text = if (loading) "Submitting…" else "Submit Registration Request →"
    }
}