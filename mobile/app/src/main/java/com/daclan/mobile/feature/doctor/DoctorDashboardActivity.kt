package com.daclan.mobile.feature.doctor

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.feature.auth.LoginActivity
import com.daclan.mobile.shared.network.DoctorCache
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

class DoctorDashboardActivity : AppCompatActivity() {

    private lateinit var prefs: android.content.SharedPreferences

    // ── Nav views ─────────────────────────────────────────────────────────
    private lateinit var tvNavName:     TextView
    private lateinit var tvNavInitials: TextView
    private lateinit var ivNavAvatar:   ImageView
    private lateinit var btnLogout:     ImageView

    private lateinit var btnNavDashboard:    LinearLayout
    private lateinit var btnNavAppointments: LinearLayout
    private lateinit var btnNavCalendar:     LinearLayout
    private lateinit var btnNavSecretary:    LinearLayout
    private lateinit var btnNavProfile:      LinearLayout

    private lateinit var iconDashboard:    ImageView
    private lateinit var iconAppointments: ImageView
    private lateinit var iconCalendar:     ImageView
    private lateinit var iconSecretary:    ImageView
    private lateinit var iconProfile:      ImageView

    private lateinit var labelDashboard:    TextView
    private lateinit var labelAppointments: TextView
    private lateinit var labelCalendar:     TextView
    private lateinit var labelSecretary:    TextView
    private lateinit var labelProfile:      TextView

    private lateinit var tvSecretaryBadge: View

    // ── Cached fragments ──────────────────────────────────────────────────
    private val dashboardFragment    by lazy { DoctorHomeFragment()        }
    private val appointmentsFragment by lazy { DoctorAppointmentsFragment() }
    private val calendarFragment     by lazy { DoctorCalendarFragment()    }
    private val secretaryFragment    by lazy { DoctorSecretaryFragment()   }
    private val profileFragment      by lazy { DoctorProfileFragment()     }
    private var activeFragment: Fragment = dashboardFragment
    private var currentTab = "dashboard"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_doctor_dashboard)

        prefs = getSharedPreferences("medicore_prefs", MODE_PRIVATE)

        bindViews()
        setupClickListeners()

        // Pre-add all fragments
        supportFragmentManager.beginTransaction().apply {
            add(R.id.doctorFragmentContainer, dashboardFragment,    "dashboard")
            add(R.id.doctorFragmentContainer, appointmentsFragment, "appointments")
            add(R.id.doctorFragmentContainer, calendarFragment,     "calendar")
            add(R.id.doctorFragmentContainer, secretaryFragment,    "secretary")
            add(R.id.doctorFragmentContainer, profileFragment,      "profile")
            hide(appointmentsFragment)
            hide(calendarFragment)
            hide(secretaryFragment)
            hide(profileFragment)
        }.commitNow()

        updateNavHighlight("dashboard")
        prefetchAllData()
    }

    private fun bindViews() {
        tvNavName     = findViewById(R.id.tvDoctorNavName)
        tvNavInitials = findViewById(R.id.tvDoctorNavInitials)
        ivNavAvatar   = findViewById(R.id.ivDoctorNavAvatar)
        btnLogout     = findViewById(R.id.btnDoctorLogout)

        btnNavDashboard    = findViewById(R.id.btnNavDashboard)
        btnNavAppointments = findViewById(R.id.btnNavDoctorAppointments)
        btnNavCalendar     = findViewById(R.id.btnNavCalendar)
        btnNavSecretary    = findViewById(R.id.btnNavSecretary)
        btnNavProfile      = findViewById(R.id.btnNavDoctorProfile)

        iconDashboard    = findViewById(R.id.iconDashboard)
        iconAppointments = findViewById(R.id.iconDoctorAppointments)
        iconCalendar     = findViewById(R.id.iconCalendar)
        iconSecretary    = findViewById(R.id.iconSecretary)
        iconProfile      = findViewById(R.id.iconDoctorProfile)

        labelDashboard    = findViewById(R.id.labelDashboard)
        labelAppointments = findViewById(R.id.labelDoctorAppointments)
        labelCalendar     = findViewById(R.id.labelCalendar)
        labelSecretary    = findViewById(R.id.labelSecretary)
        labelProfile      = findViewById(R.id.labelDoctorProfile)

        tvSecretaryBadge = findViewById(R.id.tvSecretaryBadge)

        val fn = prefs.getString("user_fname", "") ?: ""
        val ln = prefs.getString("user_lname", "") ?: ""
        tvNavName.text     = "Dr. $fn $ln".trim().ifEmpty { "Doctor" }
        tvNavInitials.text = buildInitials(fn, ln)
    }

    private fun setupClickListeners() {
        btnLogout.setOnClickListener {
            DoctorCache.clear()
            prefs.edit().clear().apply()
            startActivity(Intent(this, LoginActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
            finish()
        }

        btnNavDashboard.setOnClickListener    { switchTab("dashboard")    }
        btnNavAppointments.setOnClickListener { switchTab("appointments") }
        btnNavCalendar.setOnClickListener     { switchTab("calendar")     }
        btnNavSecretary.setOnClickListener    { switchTab("secretary")    }
        btnNavProfile.setOnClickListener      { switchTab("profile")      }
    }

    private fun prefetchAllData() {
        lifecycleScope.launch {
            val token = prefs.getString("auth_token", "") ?: return@launch

            val apptDeferred      = async { fetchAppointments(token) }
            val secretaryDeferred = async { fetchSecretary(token)    }
            val profileDeferred   = async { fetchProfile(token)      }

            apptDeferred.await()
            secretaryDeferred.await()
            profileDeferred.await()

            refreshCurrentFragment()
        }
    }

    private suspend fun fetchAppointments(token: String) {
        try {
            val resp = RetrofitClient.doctorApi.getMyAppointments(
                RetrofitClient.bearerToken(token))
            if (resp.isSuccessful && resp.body()?.success == true) {
                DoctorCache.appointments       = resp.body()?.data ?: emptyList()
                DoctorCache.appointmentsLoaded = true
            }
        } catch (_: Exception) {}
    }

    private suspend fun fetchSecretary(token: String) {
        try {
            val resp = RetrofitClient.doctorApi.getSecretaryRequests(
                RetrofitClient.bearerToken(token))
            if (resp.isSuccessful && resp.body()?.success == true) {
                DoctorCache.secretaryRequests = resp.body()?.data ?: emptyList()
                DoctorCache.secretaryLoaded   = true
                // Update pending badge
                val pending = DoctorCache.secretaryRequests
                    .count { it.status?.uppercase() == "PENDING" }
                runOnUiThread {
                    tvSecretaryBadge.visibility =
                        if (pending > 0) View.VISIBLE else View.GONE
                }
            }
        } catch (_: Exception) {}
    }

    private suspend fun fetchProfile(token: String) {
        try {
            val resp = RetrofitClient.doctorApi.getProfile(
                RetrofitClient.bearerToken(token))
            if (resp.isSuccessful && resp.body()?.success == true) {
                val profile = resp.body()?.data
                DoctorCache.profile       = profile
                DoctorCache.profileLoaded = true
                val fn = profile?.firstName ?: ""
                val ln = profile?.lastName  ?: ""
                prefs.edit()
                    .putString("user_fname", fn)
                    .putString("user_lname", ln)
                    .apply()
                runOnUiThread {
                    tvNavName.text     = "Dr. $fn $ln".trim()
                    tvNavInitials.text = buildInitials(fn, ln)
                    if (!profile?.profilePicture.isNullOrEmpty()) {
                        try {
                            val bytes  = android.util.Base64.decode(
                                profile!!.profilePicture!!.substringAfter(","),
                                android.util.Base64.DEFAULT)
                            val bitmap = android.graphics.BitmapFactory
                                .decodeByteArray(bytes, 0, bytes.size)
                            ivNavAvatar.setImageBitmap(bitmap)
                            ivNavAvatar.visibility   = View.VISIBLE
                            tvNavInitials.visibility = View.GONE
                        } catch (_: Exception) {}
                    }
                }
            }
        } catch (_: Exception) {}
    }

    fun switchTab(tab: String) {
        if (currentTab == tab) return
        currentTab = tab
        updateNavHighlight(tab)

        val target = when (tab) {
            "appointments" -> appointmentsFragment
            "calendar"     -> calendarFragment
            "secretary"    -> secretaryFragment
            "profile"      -> profileFragment
            else           -> dashboardFragment
        }

        supportFragmentManager.beginTransaction()
            .hide(activeFragment)
            .show(target)
            .commitNow()

        activeFragment = target
        refreshCurrentFragment()
    }

    private fun refreshCurrentFragment() {
        when (activeFragment) {
            is DoctorHomeFragment        -> (activeFragment as DoctorHomeFragment).loadFromCache()
            is DoctorAppointmentsFragment -> (activeFragment as DoctorAppointmentsFragment).loadFromCache()
            is DoctorCalendarFragment    -> (activeFragment as DoctorCalendarFragment).loadFromCache()
            is DoctorSecretaryFragment   -> (activeFragment as DoctorSecretaryFragment).loadFromCache()
            is DoctorProfileFragment     -> (activeFragment as DoctorProfileFragment).loadFromCache()
        }
    }

    fun refreshData() {
        DoctorCache.clear()
        prefetchAllData()
    }

    private fun updateNavHighlight(tab: String) {
        val activeColor   = 0xFF059669.toInt()  // C.green
        val inactiveColor = 0xFF94A3B8.toInt()  // C.slateXL

        listOf(labelDashboard, labelAppointments, labelCalendar, labelSecretary, labelProfile)
            .forEach { it.setTextColor(inactiveColor) }
        listOf(iconDashboard, iconAppointments, iconCalendar, iconSecretary, iconProfile)
            .forEach { it.setColorFilter(inactiveColor) }

        when (tab) {
            "dashboard"    -> { labelDashboard.setTextColor(activeColor);    iconDashboard.setColorFilter(activeColor)    }
            "appointments" -> { labelAppointments.setTextColor(activeColor); iconAppointments.setColorFilter(activeColor) }
            "calendar"     -> { labelCalendar.setTextColor(activeColor);     iconCalendar.setColorFilter(activeColor)     }
            "secretary"    -> { labelSecretary.setTextColor(activeColor);    iconSecretary.setColorFilter(activeColor)    }
            "profile"      -> { labelProfile.setTextColor(activeColor);      iconProfile.setColorFilter(activeColor)      }
        }
    }

    private fun buildInitials(first: String, last: String): String {
        val f = first.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        val l = last.trim().firstOrNull()?.uppercaseChar()?.toString()  ?: ""
        return "$f$l".ifEmpty { "D" }
    }

    fun getToken():     String = prefs.getString("auth_token", "") ?: ""
    fun getFirstName(): String = prefs.getString("user_fname", "Doctor") ?: "Doctor"
}