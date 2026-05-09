package com.daclan.mobile.feature.dashboard

import android.content.Intent
import com.daclan.mobile.feature.auth.LoginActivity
import com.daclan.mobile.R
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class DashboardActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        val prefs     = getSharedPreferences("medicore_prefs", MODE_PRIVATE)
        val userName  = prefs.getString("user_name", "Patient") ?: "Patient"
        val userEmail = prefs.getString("user_email", "") ?: ""
        val userRole  = prefs.getString("user_role", "PATIENT") ?: "PATIENT"

        findViewById<TextView>(R.id.tvWelcomeUser).text =
            "Hello, $userName! 👋"
        findViewById<TextView>(R.id.tvUserEmail).text = userEmail

        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            // Clear saved session
            prefs.edit().clear().apply()
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }
    }
}
