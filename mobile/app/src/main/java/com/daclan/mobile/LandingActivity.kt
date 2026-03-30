package com.daclan.mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class LandingActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_landing)

        val goRegister = { startActivity(Intent(this, RegisterChooseActivity::class.java)) }
        val goLogin    = { startActivity(Intent(this, LoginActivity::class.java)) }

        findViewById<Button>(R.id.btnNavLogin).setOnClickListener { goLogin() }
        findViewById<Button>(R.id.btnNavRegister).setOnClickListener { goRegister() }
        findViewById<Button>(R.id.btnHeroRegister).setOnClickListener { goRegister() }
        findViewById<Button>(R.id.btnCardRegister).setOnClickListener { goRegister() }
        findViewById<Button>(R.id.btnCtaRegister).setOnClickListener { goRegister() }
        findViewById<Button>(R.id.btnCtaLogin).setOnClickListener { goLogin() }
    }
}