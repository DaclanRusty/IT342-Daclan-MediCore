package com.daclan.mobile.feature.auth

import android.content.Intent
import com.daclan.mobile.R
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.shared.network.AvailableDoctor
import com.daclan.mobile.shared.network.RegisterRequest
import com.daclan.mobile.shared.network.RetrofitClient
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
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

    private val RC_GOOGLE = 9001
    private var googleVerifiedEmail: String? = null
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

        // ✅ Verify Google on email field click
        etEmail.isFocusable = false
        etEmail.setOnClickListener { startGoogleSignIn() }
        findViewById<Button?>(R.id.btnVerifyGoogle)?.setOnClickListener { startGoogleSignIn() }

        btnRegister.setOnClickListener { handleRegister() }
        loadDoctors()
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

    private fun loadDoctors() {
        tvDoctorLoading.visibility = View.VISIBLE
        tvDoctorLoading.text = "Loading available doctors…"
        spinnerDoctor.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getAvailableDoctors()
                if (response.isSuccessful && response.body()?.success == true) {
                    availableDoctors = response.body()?.data ?: emptyList()
                    val names = mutableListOf("Select a Doctor")
                    names.addAll(availableDoctors.map {
                        "Dr. ${it.firstname} ${it.lastname} — ${it.specialization}"
                    })
                    spinnerDoctor.adapter = ArrayAdapter(
                        this@RegisterSecretaryActivity,
                        android.R.layout.simple_spinner_dropdown_item, names
                    )
                    tvDoctorLoading.visibility = View.GONE
                    spinnerDoctor.visibility = View.VISIBLE
                    if (availableDoctors.isEmpty()) {
                        tvDoctorLoading.text = "No available doctors at this time."
                        tvDoctorLoading.visibility = View.VISIBLE
                    }
                } else {
                    tvDoctorLoading.text = "Failed to load doctors."
                }
            } catch (e: Exception) {
                tvDoctorLoading.text = "Connection error loading doctors."
            }
        }
    }

    private fun handleRegister() {
        val firstName = etFirstName.text.toString().trim()
        val lastName  = etLastName.text.toString().trim()
        val email     = etEmail.text.toString().trim()
        val phone     = etPhone.text.toString().trim()
        val password  = etPassword.text.toString().trim()
        val confirm   = etConfirmPassword.text.toString().trim()
        val doctorIdx = spinnerDoctor.selectedItemPosition

        if (googleVerifiedEmail == null) {
            showError("Please verify your Google account first."); return
        }

        when {
            firstName.isEmpty() -> { showError("First name is required"); return }
            lastName.isEmpty()  -> { showError("Last name is required"); return }
            password.length < 8 -> { showError("Password must be at least 8 characters"); return }
            password != confirm -> { showError("Passwords do not match"); return }
            doctorIdx == 0 || availableDoctors.isEmpty()
            -> { showError("Please select a doctor"); return }
        }

        val selectedDoctor = availableDoctors[doctorIdx - 1]
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

                if (response.isSuccessful && response.body()?.success == true) {
                    val msg = response.body()?.data?.message
                        ?: "Registration submitted! Please wait for the doctor to approve."
                    val intent = Intent(this@RegisterSecretaryActivity, LoginActivity::class.java)
                    intent.putExtra("success_message", msg)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                    finish()
                } else {
                    showError(response.body()?.errorMessage() ?: when (response.code()) {
                        409  -> "This email is already registered."
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
        btnRegister.text = if (loading) "Submitting…" else "Submit Registration Request →"
    }
}