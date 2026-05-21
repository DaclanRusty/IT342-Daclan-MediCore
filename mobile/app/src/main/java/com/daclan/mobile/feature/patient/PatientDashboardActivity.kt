package com.daclan.mobile.feature.patient

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.feature.auth.LoginActivity
import com.daclan.mobile.shared.network.PatientProfile
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.launch

class PatientDashboardActivity : AppCompatActivity() {

    private lateinit var prefs: android.content.SharedPreferences
    private var currentTab = "home"

    private lateinit var btnNavHome:    LinearLayout
    private lateinit var btnNavAppts:   LinearLayout
    private lateinit var btnNavDoctors: LinearLayout
    private lateinit var btnNavProfile: LinearLayout

    private lateinit var iconHome:    ImageView
    private lateinit var iconAppts:   ImageView
    private lateinit var iconDoctors: ImageView
    private lateinit var iconProfile: ImageView

    private lateinit var labelHome:    TextView
    private lateinit var labelAppts:   TextView
    private lateinit var labelDoctors: TextView
    private lateinit var labelProfile: TextView

    private lateinit var tvNavName:     TextView
    private lateinit var ivNavAvatar:   ImageView
    private lateinit var tvNavInitials: TextView
    private lateinit var btnLogout:     ImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_patient_dashboard)

        prefs = getSharedPreferences("medicore_prefs", MODE_PRIVATE)

        // ── Bind views ────────────────────────────────────────────
        tvNavName     = findViewById(R.id.tvNavName)
        ivNavAvatar   = findViewById(R.id.ivNavAvatar)
        tvNavInitials = findViewById(R.id.tvNavInitials)
        btnLogout     = findViewById(R.id.btnLogout)

        btnNavHome    = findViewById(R.id.btnNavHome)
        btnNavAppts   = findViewById(R.id.btnNavAppointments)
        btnNavDoctors = findViewById(R.id.btnNavDoctors)
        btnNavProfile = findViewById(R.id.btnNavProfile)

        iconHome    = findViewById(R.id.iconHome)
        iconAppts   = findViewById(R.id.iconAppointments)
        iconDoctors = findViewById(R.id.iconDoctors)
        iconProfile = findViewById(R.id.iconProfile)

        labelHome    = findViewById(R.id.labelHome)
        labelAppts   = findViewById(R.id.labelAppointments)
        labelDoctors = findViewById(R.id.labelDoctors)
        labelProfile = findViewById(R.id.labelProfile)

        // ── Set name from prefs (updated after profile loads) ─────
        val firstName = prefs.getString("user_fname", "") ?: ""
        val lastName  = prefs.getString("user_lname", "") ?: ""
        tvNavName.text     = "$firstName $lastName".trim().ifEmpty { "Patient" }
        tvNavInitials.text = buildInitials(firstName, lastName)

        loadProfilePicture()

        // ── Logout ────────────────────────────────────────────────
        btnLogout.setOnClickListener {
            prefs.edit().clear().apply()
            startActivity(
                Intent(this, LoginActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            )
            finish()
        }

        // ── Bottom nav clicks ─────────────────────────────────────
        btnNavHome.setOnClickListener    { switchTab("home")         }
        btnNavAppts.setOnClickListener   { switchTab("appointments") }
        btnNavDoctors.setOnClickListener { switchTab("doctors")      }
        btnNavProfile.setOnClickListener { switchTab("profile")      }

        switchTab("home")
    }

    // ── Tab switching ──────────────────────────────────────────────
    fun switchTab(tab: String) {
        currentTab = tab
        updateNavHighlight(tab)

        val fragment: Fragment = when (tab) {
            "appointments" -> AppointmentsFragment()
            "doctors"      -> DoctorsFragment()
            "profile"      -> PatientProfileFragment()
            else           -> HomeFragment()
        }

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    // ── Nav highlight — uses hardcoded hex to avoid color resource name issues ──
    private fun updateNavHighlight(tab: String) {
        val activeColor   = 0xFF2563EB.toInt()  // #2563EB — matches C.blue
        val inactiveColor = 0xFF94A3B8.toInt()  // #94A3B8 — matches C.slateXL

        // Reset all to inactive
        listOf(labelHome, labelAppts, labelDoctors, labelProfile)
            .forEach { it.setTextColor(inactiveColor) }
        listOf(iconHome, iconAppts, iconDoctors, iconProfile)
            .forEach { it.setColorFilter(inactiveColor) }

        // Set active tab
        when (tab) {
            "home" -> {
                labelHome.setTextColor(activeColor)
                iconHome.setColorFilter(activeColor)
            }
            "appointments" -> {
                labelAppts.setTextColor(activeColor)
                iconAppts.setColorFilter(activeColor)
            }
            "doctors" -> {
                labelDoctors.setTextColor(activeColor)
                iconDoctors.setColorFilter(activeColor)
            }
            "profile" -> {
                labelProfile.setTextColor(activeColor)
                iconProfile.setColorFilter(activeColor)
            }
        }
    }

    // ── Load profile picture from API ─────────────────────────────
    private fun loadProfilePicture() {
        lifecycleScope.launch {
            try {
                val token = prefs.getString("auth_token", "") ?: return@launch
                val resp  = RetrofitClient.patientApi.getProfile(RetrofitClient.bearerToken(token))
                if (resp.isSuccessful && resp.body()?.success == true) {
                    val profile = resp.body()?.data
                    updateNavAvatar(profile)
                    prefs.edit()
                        .putString("user_fname", profile?.firstName ?: "")
                        .putString("user_lname", profile?.lastName  ?: "")
                        .apply()
                    val fn = profile?.firstName ?: ""
                    val ln = profile?.lastName  ?: ""
                    tvNavName.text     = "$fn $ln".trim()
                    tvNavInitials.text = buildInitials(fn, ln)
                }
            } catch (_: Exception) { /* fail silently — prefs values already shown */ }
        }
    }

    // ── Update navbar avatar circle ───────────────────────────────
    fun updateNavAvatar(profile: PatientProfile?) {
        if (profile?.profilePicture != null) {
            try {
                val bytes  = android.util.Base64.decode(
                    profile.profilePicture.substringAfter(","), android.util.Base64.DEFAULT)
                val bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivNavAvatar.setImageBitmap(bitmap)
                ivNavAvatar.visibility   = View.VISIBLE
                tvNavInitials.visibility = View.GONE
            } catch (_: Exception) {
                ivNavAvatar.visibility   = View.GONE
                tvNavInitials.visibility = View.VISIBLE
            }
        } else {
            ivNavAvatar.visibility   = View.GONE
            tvNavInitials.visibility = View.VISIBLE
        }
    }

    // ── Helpers ───────────────────────────────────────────────────
    private fun buildInitials(first: String, last: String): String {
        val f = first.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        val l = last.trim().firstOrNull()?.uppercaseChar()?.toString()  ?: ""
        return "$f$l".ifEmpty { "P" }
    }

    fun getToken(): String     = prefs.getString("auth_token", "") ?: ""

    fun getUserName(): String {
        val fn = prefs.getString("user_fname", "") ?: ""
        val ln = prefs.getString("user_lname", "") ?: ""
        return "$fn $ln".trim().ifEmpty { "Patient" }
    }

    fun getFirstName(): String = prefs.getString("user_fname", "there") ?: "there"
}