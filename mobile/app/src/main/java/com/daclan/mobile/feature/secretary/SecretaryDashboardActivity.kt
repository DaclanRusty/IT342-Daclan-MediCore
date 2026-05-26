package com.daclan.mobile.feature.secretary

import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Base64
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.feature.auth.LoginActivity
import com.daclan.mobile.shared.network.RetrofitClient
import com.daclan.mobile.shared.network.SecretaryDataCache
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

class SecretaryDashboardActivity : AppCompatActivity() {

    private lateinit var prefs: android.content.SharedPreferences
    private var currentTab = "home"

    // ── Bottom nav containers ──────────────────────────────────────────────
    private lateinit var btnNavHome:    LinearLayout
    private lateinit var btnNavAppts:   LinearLayout
    private lateinit var btnNavProfile: LinearLayout

    // ── Nav icons ──────────────────────────────────────────────────────────
    private lateinit var iconHome:    ImageView
    private lateinit var iconAppts:   ImageView
    private lateinit var iconProfile: ImageView

    // ── Nav labels ─────────────────────────────────────────────────────────
    private lateinit var labelHome:    TextView
    private lateinit var labelAppts:   TextView
    private lateinit var labelProfile: TextView

    // ── Top bar ────────────────────────────────────────────────────────────
    private lateinit var tvNavName:     TextView
    private lateinit var ivNavAvatar:   ImageView
    private lateinit var tvNavInitials: TextView
    private lateinit var btnLogout:     ImageView

    // ── Fragments ──────────────────────────────────────────────────────────
    private val homeFragment         by lazy { SecretaryHomeFragment() }
    private val appointmentsFragment by lazy { SecretaryAppointmentsFragment() }
    private val profileFragment      by lazy { SecretaryProfileFragment() }

    private var activeFragment: Fragment = homeFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_secretary_dashboard)

        prefs = getSharedPreferences("medicore_prefs", MODE_PRIVATE)

        // Top bar
        tvNavName     = findViewById(R.id.tvSecNavName)
        ivNavAvatar   = findViewById(R.id.ivSecNavAvatar)
        tvNavInitials = findViewById(R.id.tvSecNavInitials)
        btnLogout     = findViewById(R.id.btnSecLogout)

        // Bottom nav
        btnNavHome    = findViewById(R.id.btnSecNavHome)
        btnNavAppts   = findViewById(R.id.btnSecNavAppointments)
        btnNavProfile = findViewById(R.id.btnSecNavProfile)

        iconHome    = findViewById(R.id.iconSecHome)
        iconAppts   = findViewById(R.id.iconSecAppointments)
        iconProfile = findViewById(R.id.iconSecProfile)

        labelHome    = findViewById(R.id.labelSecHome)
        labelAppts   = findViewById(R.id.labelSecAppointments)
        labelProfile = findViewById(R.id.labelSecProfile)

        // Populate name from prefs immediately
        val firstName = prefs.getString("user_fname", "") ?: ""
        val lastName  = prefs.getString("user_lname", "") ?: ""
        tvNavName.text     = "$firstName $lastName".trim().ifEmpty { "Secretary" }
        tvNavInitials.text = buildInitials(firstName, lastName)

        btnLogout.setOnClickListener {
            SecretaryDataCache.clear()
            prefs.edit().clear().apply()
            startActivity(
                Intent(this, LoginActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            )
            finish()
        }

        btnNavHome.setOnClickListener    { switchTab("home") }
        btnNavAppts.setOnClickListener   { switchTab("appointments") }
        btnNavProfile.setOnClickListener { switchTab("profile") }

        // Add all fragments, hide non-home ones
        supportFragmentManager.beginTransaction().apply {
            add(R.id.secFragmentContainer, homeFragment,         "sec_home")
            add(R.id.secFragmentContainer, appointmentsFragment, "sec_appointments")
            add(R.id.secFragmentContainer, profileFragment,      "sec_profile")
            hide(appointmentsFragment)
            hide(profileFragment)
        }.commitNow()

        updateNavHighlight("home")
        prefetchAllData()
    }

    // ── Data fetching ──────────────────────────────────────────────────────

    private fun prefetchAllData() {
        lifecycleScope.launch {
            val token = getToken()
            android.util.Log.d("SEC_DEBUG", "token=$token")
            if (token.isEmpty()) return@launch

            val apptDeferred    = async { fetchAppointments(token) }
            val profileDeferred = async { fetchProfile(token) }

            apptDeferred.await()
            profileDeferred.await()

            refreshCurrentFragment()
        }
    }

    private suspend fun fetchAppointments(token: String) {
        try {
            val resp = RetrofitClient.secretaryApi.getAppointments(
                RetrofitClient.bearerToken(token)
            )
            android.util.Log.d("SEC_APPT", "code=${resp.code()} size=${resp.body()?.data?.size}")
            if (resp.isSuccessful && resp.body()?.success == true) {
                SecretaryDataCache.appointments = resp.body()?.data ?: emptyList()
            }
        } catch (e: Exception) {
            android.util.Log.e("SEC_APPT", "ERROR: ${e.message}")
        } finally {
            SecretaryDataCache.appointmentsLoaded = true
        }
    }

    private suspend fun fetchProfile(token: String) {
        try {
            val resp = RetrofitClient.secretaryApi.getProfile(
                RetrofitClient.bearerToken(token)
            )
            android.util.Log.d("SEC_PROFILE", "code=${resp.code()} success=${resp.body()?.success}")
            if (resp.isSuccessful && resp.body()?.success == true) {
                val profile = resp.body()?.data
                SecretaryDataCache.profile = profile
                runOnUiThread {
                    updateNavAvatar(profile?.profilePicture)
                    val fn = profile?.firstName ?: ""
                    val ln = profile?.lastName  ?: ""
                    tvNavName.text     = "$fn $ln".trim().ifEmpty { "Secretary" }
                    tvNavInitials.text = buildInitials(fn, ln)
                }
                prefs.edit()
                    .putString("user_fname", profile?.firstName ?: "")
                    .putString("user_lname", profile?.lastName  ?: "")
                    .apply()
            }
        } catch (e: Exception) {
            android.util.Log.e("SEC_PROFILE", "ERROR: ${e.message}")
        } finally {
            SecretaryDataCache.profileLoaded = true  // always mark done
        }
    }

    fun refreshCurrentFragment() {
        runOnUiThread {
            when (activeFragment) {
                is SecretaryHomeFragment         -> (activeFragment as SecretaryHomeFragment).loadFromCache()
                is SecretaryAppointmentsFragment -> (activeFragment as SecretaryAppointmentsFragment).loadFromCache()
                is SecretaryProfileFragment      -> (activeFragment as SecretaryProfileFragment).loadFromCache()
            }
        }
    }

    fun switchTab(tab: String) {
        if (currentTab == tab) return
        currentTab = tab
        updateNavHighlight(tab)

        val target = when (tab) {
            "appointments" -> appointmentsFragment
            "profile"      -> profileFragment
            else           -> homeFragment
        }

        supportFragmentManager.beginTransaction()
            .hide(activeFragment)
            .show(target)
            .commitNow()

        activeFragment = target
        refreshCurrentFragment()
    }

    private fun updateNavHighlight(tab: String) {
        val activeColor   = 0xFF7C3AED.toInt()
        val inactiveColor = 0xFF94A3B8.toInt()

        listOf(labelHome, labelAppts, labelProfile)
            .forEach { it.setTextColor(inactiveColor) }
        listOf(iconHome, iconAppts, iconProfile)
            .forEach { it.setColorFilter(inactiveColor) }

        when (tab) {
            "home"         -> { labelHome.setTextColor(activeColor);    iconHome.setColorFilter(activeColor) }
            "appointments" -> { labelAppts.setTextColor(activeColor);   iconAppts.setColorFilter(activeColor) }
            "profile"      -> { labelProfile.setTextColor(activeColor); iconProfile.setColorFilter(activeColor) }
        }
    }

    // ── Avatar ─────────────────────────────────────────────────────────────

    fun updateNavAvatar(profilePicture: String?) {
        if (!profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(profilePicture.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
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

    // ── Helpers ────────────────────────────────────────────────────────────

    private fun buildInitials(first: String, last: String): String {
        val f = first.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        val l = last.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        return "$f$l".ifEmpty { "S" }
    }

    fun getToken(): String     = prefs.getString("auth_token", "") ?: ""
    fun getFirstName(): String = prefs.getString("user_fname", "there") ?: "there"

    fun refreshAppointments() {
        lifecycleScope.launch {
            fetchAppointments(getToken())
            refreshCurrentFragment()
        }
    }
}