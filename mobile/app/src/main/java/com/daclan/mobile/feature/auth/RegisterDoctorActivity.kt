package com.daclan.mobile.feature.auth

import android.content.Intent
import com.daclan.mobile.R
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.shared.network.RegisterRequest
import com.daclan.mobile.shared.network.RetrofitClient
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
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

    private val RC_GOOGLE = 9001
    private var googleVerifiedEmail: String? = null

    private val specializations = listOf(
        "Select Specialization", "General Medicine", "Cardiology", "Dermatology",
        "Endocrinology", "Gastroenterology", "Neurology", "Obstetrics & Gynecology",
        "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics", "Psychiatry",
        "Pulmonology", "Radiology", "Surgery", "Urology", "Other"
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

        spinnerSpec.adapter = ArrayAdapter(
            this, android.R.layout.simple_spinner_dropdown_item, specializations
        )

        btnBack.setOnClickListener { finish() }

        // ✅ Verify Google on email field click
        etEmail.isFocusable = false
        etEmail.setOnClickListener { startGoogleSignIn() }

        // Or if you have a dedicated verify button
        findViewById<Button?>(R.id.btnVerifyGoogle)?.setOnClickListener { startGoogleSignIn() }

        btnRegister.setOnClickListener { handleRegister() }
    }

    private fun startGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.google_web_client_id))
            .requestEmail()
            .build()
        startActivityForResult(GoogleSignIn.getClient(this, gso).signInIntent, RC_GOOGLE)
    }

    @Deprecated("Using for Google Sign-In result")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != RC_GOOGLE) return
        try {
            val account: GoogleSignInAccount = GoogleSignIn
                .getSignedInAccountFromIntent(data)
                .getResult(ApiException::class.java)
            googleVerifiedEmail = account.email
            etEmail.setText(account.email ?: "")
            if (etFirstName.text.isBlank()) etFirstName.setText(account.givenName ?: "")
            if (etLastName.text.isBlank())  etLastName.setText(account.familyName ?: "")
            findViewById<TextView?>(R.id.tvGoogleStatus)?.apply {
                text = "✓ Verified: ${account.email}"
                setTextColor(0xFF059669.toInt())
                visibility = View.VISIBLE
            }
            hideError()
        } catch (e: ApiException) {
            showError("Google sign-in failed. Please try again.")
        }
    }

    private fun handleRegister() {
        val firstName      = etFirstName.text.toString().trim()
        val lastName       = etLastName.text.toString().trim()
        val email          = etEmail.text.toString().trim()
        val phone          = etPhone.text.toString().trim()
        val specialization = spinnerSpec.selectedItem.toString()
        val license        = etLicense.text.toString().trim()
        val password       = etPassword.text.toString().trim()
        val confirm        = etConfirmPassword.text.toString().trim()

        if (googleVerifiedEmail == null) {
            showError("Please verify your Google account first."); return
        }

        when {
            firstName.isEmpty()  -> { showError("First name is required"); return }
            lastName.isEmpty()   -> { showError("Last name is required"); return }
            specialization == "Select Specialization"
            -> { showError("Please select a specialization"); return }
            license.isEmpty()    -> { showError("License number is required"); return }
            password.length < 8  -> { showError("Password must be at least 8 characters"); return }
            password != confirm  -> { showError("Passwords do not match"); return }
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

                if (response.isSuccessful && response.body()?.success == true) {
                    val msg = response.body()?.data?.message
                        ?: "Registration submitted! Please wait for admin approval."
                    val intent = Intent(this@RegisterDoctorActivity, LoginActivity::class.java)
                    intent.putExtra("success_message", msg)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                    finish()
                } else {
                    showError(response.body()?.errorMessage() ?: when (response.code()) {
                        409  -> "This email or license number is already registered."
                        400  -> "Invalid details. Please check your inputs."
                        else -> "Registration failed (${response.code()})"
                    })
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