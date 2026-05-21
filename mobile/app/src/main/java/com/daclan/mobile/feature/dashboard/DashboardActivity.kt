package com.daclan.mobile.feature.dashboard

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.daclan.mobile.feature.auth.LoginActivity
import com.daclan.mobile.feature.patient.PatientDashboardActivity

class DashboardActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs    = getSharedPreferences("medicore_prefs", MODE_PRIVATE)
        val role     = prefs.getString("user_role", "PATIENT") ?: "PATIENT"
        val token    = prefs.getString("auth_token", "") ?: ""

        // If no token, send back to login
        if (token.isEmpty()) {
            startActivity(Intent(this, LoginActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
            finish()
            return
        }

        // Route based on role
        val intent = when {
            role.contains("PATIENT",   ignoreCase = true) ->
                Intent(this, PatientDashboardActivity::class.java)
            role.contains("DOCTOR",    ignoreCase = true) ->
                Intent(this, PatientDashboardActivity::class.java) // TODO: DoctorDashboardActivity
            role.contains("SECRETARY", ignoreCase = true) ->
                Intent(this, PatientDashboardActivity::class.java) // TODO: SecretaryDashboardActivity
            role.contains("ADMIN",     ignoreCase = true) ->
                Intent(this, PatientDashboardActivity::class.java) // TODO: AdminDashboardActivity
            else ->
                Intent(this, PatientDashboardActivity::class.java)
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        startActivity(intent)
        finish()
    }
}