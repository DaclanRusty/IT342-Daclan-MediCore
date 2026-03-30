package com.daclan.mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.network.LoginRequest
import com.daclan.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var btnGoToRegister: Button
    private lateinit var tvError: TextView
    private lateinit var layoutSuccess: LinearLayout
    private lateinit var tvSuccessMsg: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etEmail         = findViewById(R.id.etEmail)
        etPassword      = findViewById(R.id.etPassword)
        btnLogin        = findViewById(R.id.btnLogin)
        btnGoToRegister = findViewById(R.id.btnGoToRegister)
        tvError         = findViewById(R.id.tvError)
        layoutSuccess   = findViewById(R.id.layoutSuccess)
        tvSuccessMsg    = findViewById(R.id.tvSuccessMsg)

        // Show success message if came from registration
        val successMsg = intent.getStringExtra("success_message")
        if (!successMsg.isNullOrEmpty()) {
            tvSuccessMsg.text = "✓  $successMsg"
            layoutSuccess.visibility = View.VISIBLE
        }

        // ← THIS WAS MISSING
        btnLogin.setOnClickListener { handleLogin() }

        btnGoToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterChooseActivity::class.java))
        }
    }

    private fun handleLogin() {
        val email    = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()

        // Validate
        if (email.isEmpty() || password.isEmpty()) {
            showError("Please fill in all fields")
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showError("Please enter a valid email address")
            return
        }

        hideError()
        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.login(LoginRequest(email, password))

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    val token = body.data?.accessToken        // ← fix
                    val user  = body.data?.user               // ← fix

                    val prefs = getSharedPreferences("medicore_prefs", MODE_PRIVATE)
                    prefs.edit()
                        .putString("access_token", token)
                        .putString("user_email", user?.email ?: email)
                        .putString("user_name", "${user?.firstname ?: ""} ${user?.lastname ?: ""}".trim())
                        .putString("user_role", user?.role ?: "PATIENT")
                        .apply()

                    // navigate to dashboard or home
                    startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                    finish()

                } else {
                    val errorMsg = when (response.code()) {
                        401 -> "Invalid email or password"
                        403 -> "Your account is pending approval"
                        else -> "Login failed. Please try again."
                    }
                    showError(errorMsg)
                }

            } catch (e: Exception) {
                showError("Connection error. Make sure your backend is running.")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun showError(msg: String) {
        tvError.text = msg
        tvError.visibility = View.VISIBLE
        layoutSuccess.visibility = View.GONE
    }

    private fun hideError() {
        tvError.visibility = View.GONE
    }

    private fun setLoading(loading: Boolean) {
        btnLogin.isEnabled = !loading
        btnLogin.text = if (loading) "Signing in…" else "Sign In →"
    }
}