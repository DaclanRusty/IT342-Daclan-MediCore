package com.daclan.mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity

class RegisterChooseActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_choose)

        findViewById<LinearLayout>(R.id.cardPatient).setOnClickListener {
            startActivity(Intent(this, RegisterPatientActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.cardDoctor).setOnClickListener {
            startActivity(Intent(this, RegisterDoctorActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.cardSecretary).setOnClickListener {
            startActivity(Intent(this, RegisterSecretaryActivity::class.java))
        }
        findViewById<Button>(R.id.btnPatient).setOnClickListener {
            startActivity(Intent(this, RegisterPatientActivity::class.java))
        }
        findViewById<Button>(R.id.btnDoctor).setOnClickListener {
            startActivity(Intent(this, RegisterDoctorActivity::class.java))
        }
        findViewById<Button>(R.id.btnSecretary).setOnClickListener {
            startActivity(Intent(this, RegisterSecretaryActivity::class.java))
        }
        findViewById<Button>(R.id.btnBackToLogin).setOnClickListener {
            finish()
        }
    }
}