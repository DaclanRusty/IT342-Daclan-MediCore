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
import com.daclan.mobile.shared.network.DataCache
import com.daclan.mobile.shared.network.PatientProfile
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

class PatientDashboardActivity : AppCompatActivity() {

    private lateinit var prefs: android.content.SharedPreferences
    private var currentTab = "home"

    private lateinit var btnNavHome: LinearLayout
    private lateinit var btnNavAppts: LinearLayout
    private lateinit var btnNavDoctors: LinearLayout
    private lateinit var btnNavProfile: LinearLayout

    private lateinit var iconHome: ImageView
    private lateinit var iconAppts: ImageView
    private lateinit var iconDoctors: ImageView
    private lateinit var iconProfile: ImageView

    private lateinit var labelHome: TextView
    private lateinit var labelAppts: TextView
    private lateinit var labelDoctors: TextView
    private lateinit var labelProfile: TextView

    private lateinit var tvNavName: TextView
    private lateinit var ivNavAvatar: ImageView
    private lateinit var tvNavInitials: TextView
    private lateinit var btnLogout: ImageView

    private val homeFragment by lazy { HomeFragment() }
    private val appointmentsFragment by lazy { AppointmentsFragment() }
    private val doctorsFragment by lazy { DoctorsFragment() }
    private val profileFragment by lazy { PatientProfileFragment() }

    private var activeFragment: Fragment = homeFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_patient_dashboard)

        prefs = getSharedPreferences("medicore_prefs", MODE_PRIVATE)

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

        val firstName = prefs.getString("user_fname", "") ?: ""
        val lastName  = prefs.getString("user_lname", "") ?: ""

        tvNavName.text     = "$firstName $lastName".trim().ifEmpty { "Patient" }
        tvNavInitials.text = buildInitials(firstName, lastName)

        btnLogout.setOnClickListener {
            DataCache.clear()
            prefs.edit().clear().apply()
            startActivity(
                Intent(this, LoginActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            )
            finish()
        }

        btnNavHome.setOnClickListener    { switchTab("home") }
        btnNavAppts.setOnClickListener   { switchTab("appointments") }
        btnNavDoctors.setOnClickListener { switchTab("doctors") }
        btnNavProfile.setOnClickListener { switchTab("profile") }

        supportFragmentManager.beginTransaction().apply {
            add(R.id.fragmentContainer, homeFragment,         "home")
            add(R.id.fragmentContainer, appointmentsFragment, "appointments")
            add(R.id.fragmentContainer, doctorsFragment,      "doctors")
            add(R.id.fragmentContainer, profileFragment,      "profile")
            hide(appointmentsFragment)
            hide(doctorsFragment)
            hide(profileFragment)
        }.commitNow()

        updateNavHighlight("home")
        prefetchAllData()
    }

    private fun prefetchAllData() {
        lifecycleScope.launch {
            val token = getToken()
            if (token.isEmpty()) return@launch

            val apptDeferred    = async { fetchAppointments(token) }
            val doctorsDeferred = async { fetchDoctors(token) }
            val profileDeferred = async { fetchProfile(token) }

            apptDeferred.await()
            doctorsDeferred.await()
            profileDeferred.await()

            runOnUiThread {
                refreshCurrentFragment()
            }
        }
    }

    fun switchTab(tab: String) {
        if (currentTab == tab) return
        currentTab = tab
        updateNavHighlight(tab)

        val target = when (tab) {
            "appointments" -> appointmentsFragment
            "doctors"      -> doctorsFragment
            "profile"      -> profileFragment
            else           -> homeFragment
        }

        supportFragmentManager.beginTransaction()
            .hide(activeFragment)
            .show(target)
            .commitNow()

        activeFragment = target

        runOnUiThread {
            refreshCurrentFragment()
        }
    }

    private suspend fun fetchAppointments(token: String) {
        android.util.Log.d("APPT", "Fetching appointments...")
        try {
            val resp = RetrofitClient.patientApi.getMyAppointments(
                RetrofitClient.bearerToken(token)
            )
            android.util.Log.d("APPT", "Response code: ${resp.code()}, success: ${resp.body()?.success}")
            if (resp.isSuccessful && resp.body()?.success == true) {
                DataCache.appointments       = resp.body()?.data ?: emptyList()
                DataCache.appointmentsLoaded = true
                android.util.Log.d("APPT", "Loaded ${DataCache.appointments.size} appointments")
            } else {
                android.util.Log.e("APPT", "Failed: ${resp.code()} ${resp.errorBody()?.string()}")
            }
        } catch (e: Exception) {
            android.util.Log.e("APPT", "Exception: ${e.javaClass.simpleName}: ${e.message}")
        }
    }

    private suspend fun fetchDoctors(token: String) {
        try {
            val resp = RetrofitClient.patientApi.getAllDoctors(
                RetrofitClient.bearerToken(token)
            )

            android.util.Log.d("DOCTOR_PROFILE", "code=${resp.code()} success=${resp.body()?.success}")

            if (resp.isSuccessful && resp.body()?.success == true) {
                DataCache.doctors = resp.body()?.data ?: emptyList()
                DataCache.doctorsLoaded = true

                android.util.Log.d("DOCTOR_PROFILE", "Loaded doctors=${DataCache.doctors.size}")

                DataCache.doctors.forEach {
                    android.util.Log.d(
                        "DOCTOR_PROFILE",
                        "doctor=${it.firstName} ${it.lastName}, doctorId=${it.doctorId}, pic=${it.profilePicture?.take(50)}"
                    )
                }
            } else {
                android.util.Log.e("DOCTOR_PROFILE", "Failed doctors: ${resp.code()} ${resp.errorBody()?.string()}")
            }
        } catch (e: Exception) {
            android.util.Log.e("DOCTOR_PROFILE", "Exception: ${e.javaClass.simpleName}: ${e.message}")
        }
    }

    private suspend fun fetchProfile(token: String) {
        try {
            val resp = RetrofitClient.patientApi.getProfile(
                RetrofitClient.bearerToken(token)
            )
            if (resp.isSuccessful && resp.body()?.success == true) {
                val profile = resp.body()?.data

                DataCache.profile       = profile
                DataCache.profileLoaded = true

                val bitmap = if (profile?.profilePicture != null) {
                    try {
                        val bytes = android.util.Base64.decode(
                            profile.profilePicture.substringAfter(","),
                            android.util.Base64.DEFAULT
                        )
                        android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    } catch (_: Exception) { null }
                } else null

                runOnUiThread {
                    val fn = profile?.firstName ?: ""
                    val ln = profile?.lastName  ?: ""
                    tvNavName.text     = "$fn $ln".trim().ifEmpty { "Patient" }
                    tvNavInitials.text = buildInitials(fn, ln)

                    if (bitmap != null) {
                        ivNavAvatar.setImageBitmap(bitmap)
                        ivNavAvatar.visibility   = View.VISIBLE
                        tvNavInitials.visibility = View.GONE
                    } else {
                        ivNavAvatar.visibility   = View.GONE
                        tvNavInitials.visibility = View.VISIBLE
                    }
                }

                prefs.edit()
                    .putString("user_fname", profile?.firstName ?: "")
                    .putString("user_lname", profile?.lastName  ?: "")
                    .apply()
            }
        } catch (_: Exception) {}
    }

    private fun refreshCurrentFragment() {
        when (activeFragment) {
            is HomeFragment           -> (activeFragment as HomeFragment).loadFromCache()
            is AppointmentsFragment   -> (activeFragment as AppointmentsFragment).loadFromCache()
            is DoctorsFragment        -> (activeFragment as DoctorsFragment).loadFromCache()
            is PatientProfileFragment -> (activeFragment as PatientProfileFragment).loadFromCache()
        }
    }

    private fun updateNavHighlight(tab: String) {
        val activeColor   = 0xFF2563EB.toInt()
        val inactiveColor = 0xFF94A3B8.toInt()

        listOf(labelHome, labelAppts, labelDoctors, labelProfile)
            .forEach { it.setTextColor(inactiveColor) }
        listOf(iconHome, iconAppts, iconDoctors, iconProfile)
            .forEach { it.setColorFilter(inactiveColor) }

        when (tab) {
            "home"         -> { labelHome.setTextColor(activeColor);   iconHome.setColorFilter(activeColor) }
            "appointments" -> { labelAppts.setTextColor(activeColor);  iconAppts.setColorFilter(activeColor) }
            "doctors"      -> { labelDoctors.setTextColor(activeColor); iconDoctors.setColorFilter(activeColor) }
            "profile"      -> { labelProfile.setTextColor(activeColor); iconProfile.setColorFilter(activeColor) }
        }
    }

    fun updateNavAvatar(profile: PatientProfile?) {
        if (profile?.profilePicture != null) {
            try {
                val bytes  = android.util.Base64.decode(
                    profile.profilePicture.substringAfter(","),
                    android.util.Base64.DEFAULT
                )
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

    private fun buildInitials(first: String, last: String): String {
        val f = first.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        val l = last.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        return "$f$l".ifEmpty { "P" }
    }

    fun getToken(): String     = prefs.getString("auth_token", "") ?: ""
    fun getFirstName(): String = prefs.getString("user_fname", "there") ?: "there"
    fun getUserName(): String  =
        "${prefs.getString("user_fname", "")} ${prefs.getString("user_lname", "")}"
            .trim().ifEmpty { "Patient" }
}