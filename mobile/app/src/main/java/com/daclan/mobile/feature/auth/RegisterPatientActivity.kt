package com.daclan.mobile.feature.auth

import android.app.DatePickerDialog
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
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
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
    private lateinit var btnVerifyGoogle: Button
    private lateinit var tvGoogleStatus: TextView
    private lateinit var btnBack: Button
    private lateinit var tvError: TextView

    private val RC_GOOGLE = 9001
    private var googleVerifiedEmail: String? = null

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
        btnVerifyGoogle   = findViewById(R.id.btnVerifyGoogle)
        tvGoogleStatus    = findViewById(R.id.tvGoogleStatus)
        btnBack           = findViewById(R.id.btnBack)
        tvError           = findViewById(R.id.tvError)

        // Register button disabled until Google verified
        btnRegister.isEnabled = false
        btnRegister.alpha = 0.5f

        spinnerGender.adapter = ArrayAdapter(
            this, android.R.layout.simple_spinner_dropdown_item,
            listOf("Select Gender", "MALE", "FEMALE", "OTHER")
        )

        etDob.isFocusable = false
        etDob.setOnClickListener {
            val cal = Calendar.getInstance()
            DatePickerDialog(this, { _, y, m, d ->
                etDob.setText("$y-${(m+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}")
            }, cal.get(Calendar.YEAR) - 20, cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)).show()
        }

        btnBack.setOnClickListener { finish() }
        btnVerifyGoogle.setOnClickListener { startGoogleSignIn() }
        btnRegister.setOnClickListener { handleRegister() }
    }

    private fun startGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.google_web_client_id))
            .requestEmail()
            .build()
        // Sign out first so user can pick account each time
        GoogleSignIn.getClient(this, gso).signOut().addOnCompleteListener {
            startActivityForResult(GoogleSignIn.getClient(this, gso).signInIntent, RC_GOOGLE)
        }
    }

    @Deprecated("Using for Google Sign-In result")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != RC_GOOGLE) return
        try {
            val account = GoogleSignIn.getSignedInAccountFromIntent(data)
                .getResult(ApiException::class.java)

            googleVerifiedEmail = account.email
            etEmail.setText(account.email ?: "")
            if (etFirstName.text.isBlank()) etFirstName.setText(account.givenName ?: "")
            if (etLastName.text.isBlank())  etLastName.setText(account.familyName ?: "")

            // ✅ Show verified status
            tvGoogleStatus.text = "✓ Google verified: ${account.email}"
            tvGoogleStatus.visibility = View.VISIBLE

            // ✅ Enable register button
            btnRegister.isEnabled = true
            btnRegister.alpha = 1.0f

            // ✅ Update verify button to show it's done
            btnVerifyGoogle.text = "✓ Google Verified — Tap to Change"

            hideError()
        } catch (e: ApiException) {
            showError("Google sign-in failed. Please try again.")
        }
    }

    private fun handleRegister() {
        val firstName = etFirstName.text.toString().trim()
        val lastName  = etLastName.text.toString().trim()
        val email     = etEmail.text.toString().trim()
        val phone     = etPhone.text.toString().trim()
        val dob       = etDob.text.toString().trim()
        val gender    = spinnerGender.selectedItem.toString()
        val address   = etAddress.text.toString().trim()
        val password  = etPassword.text.toString().trim()
        val confirm   = etConfirmPassword.text.toString().trim()

        if (googleVerifiedEmail == null) {
            showError("Please verify your Google account first."); return
        }

        when {
            firstName.isEmpty()       -> { showError("First name is required"); return }
            lastName.isEmpty()        -> { showError("Last name is required"); return }
            dob.isEmpty()             -> { showError("Date of birth is required"); return }
            gender == "Select Gender" -> { showError("Please select a gender"); return }
            address.isEmpty()         -> { showError("Address is required"); return }
            password.length < 8       -> { showError("Password must be at least 8 characters"); return }
            password != confirm       -> { showError("Passwords do not match"); return }
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
                        role           = "PATIENT",
                        googleVerified = true,
                        dateOfBirth    = dob,
                        gender         = gender,
                        address        = address
                    )
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    val intent = Intent(this@RegisterPatientActivity, LoginActivity::class.java)
                    intent.putExtra("success_message", "Account created! You can now sign in.")
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
        btnRegister.alpha = if (loading) 0.7f else 1.0f
        btnRegister.text = if (loading) "Creating Account…" else "Create Patient Account →"
    }
}