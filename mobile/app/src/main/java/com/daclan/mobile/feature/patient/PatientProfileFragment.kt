package com.daclan.mobile.feature.patient

import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Base64
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.PatientProfile
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class PatientProfileFragment : Fragment() {

    private lateinit var tvInitials:    TextView
    private lateinit var ivPic:         ImageView
    private lateinit var tvFullName:    TextView
    private lateinit var tvEmail:       TextView
    private lateinit var tvEmailField:  TextView
    private lateinit var tvStatus:      TextView
    private lateinit var tvName:        TextView
    private lateinit var tvPhone:       TextView
    private lateinit var tvDob:         TextView
    private lateinit var tvGender:      TextView
    private lateinit var tvAddress:     TextView
    private lateinit var layoutSuccess: LinearLayout
    private lateinit var layoutError:   LinearLayout
    private lateinit var tvError:       TextView
    private lateinit var btnChangePic:  LinearLayout

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_patient_profile, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        tvInitials    = view.findViewById(R.id.tvProfileInitials)
        ivPic         = view.findViewById(R.id.ivProfilePic)
        tvFullName    = view.findViewById(R.id.tvProfileFullName)
        tvEmail       = view.findViewById(R.id.tvProfileEmail)
        tvEmailField  = view.findViewById(R.id.tvProfileEmailField)
        tvStatus      = view.findViewById(R.id.tvProfileStatus)
        tvName        = view.findViewById(R.id.tvProfileName)
        tvPhone       = view.findViewById(R.id.tvProfilePhone)
        tvDob         = view.findViewById(R.id.tvProfileDob)
        tvGender      = view.findViewById(R.id.tvProfileGender)
        tvAddress     = view.findViewById(R.id.tvProfileAddress)
        layoutSuccess = view.findViewById(R.id.layoutProfileSuccess)
        layoutError   = view.findViewById(R.id.layoutProfileError)
        tvError       = view.findViewById(R.id.tvProfileError)
        btnChangePic  = view.findViewById(R.id.btnChangePic)

        btnChangePic.setOnClickListener { pickImage() }

        loadProfile()
    }

    private fun loadProfile() {
        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token = dashboard.getToken()
                val resp  = RetrofitClient.patientApi.getProfile(RetrofitClient.bearerToken(token))
                if (resp.isSuccessful && resp.body()?.success == true) {
                    val profile = resp.body()?.data
                    renderProfile(profile)
                } else {
                    showError("Failed to load profile.")
                }
            } catch (_: Exception) {
                showError("Connection error. Check your internet.")
            }
        }
    }

    private fun renderProfile(profile: PatientProfile?) {
        if (profile == null) { showError("Profile not found."); return }

        val fn = profile.firstName ?: ""
        val ln = profile.lastName  ?: ""

        // Avatar
        tvInitials.text = buildInitials(fn, ln)
        if (profile.profilePicture != null) {
            try {
                val bytes  = Base64.decode(profile.profilePicture.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility      = View.VISIBLE
                tvInitials.visibility = View.GONE
            } catch (_: Exception) { }
        }

        // Header info
        tvFullName.text    = "$fn $ln".trim().ifEmpty { "Patient" }
        tvEmail.text       = profile.email ?: ""
        tvEmailField.text  = profile.email ?: ""
        tvStatus.text      = profile.status ?: "ACTIVE"

        // Info fields — "Not provided" shown via hint in XML
        tvName.text    = "$fn $ln".trim().ifEmpty { "" }
        tvPhone.text   = profile.phoneNumber ?: ""
        tvDob.text     = formatDate(profile.dateOfBirth)
        tvGender.text  = profile.gender ?: ""
        tvAddress.text = profile.address ?: ""

        // Also update the navbar avatar
        (activity as? PatientDashboardActivity)?.updateNavAvatar(profile)
    }

    private fun pickImage() {
        val intent = android.content.Intent(android.content.Intent.ACTION_PICK).apply {
            type = "image/*"
        }
        pickImageLauncher.launch(intent)
    }

    private val pickImageLauncher = registerForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK) {
            val uri = result.data?.data ?: return@registerForActivityResult
            val inputStream = requireContext().contentResolver.openInputStream(uri) ?: return@registerForActivityResult
            val bytes = inputStream.readBytes()
            if (bytes.size > 2 * 1024 * 1024) {
                showError("Image must be under 2MB.")
                return@registerForActivityResult
            }
            val base64 = "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
            uploadPicture(base64)
        }
    }

    private fun uploadPicture(base64: String) {
        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token = dashboard.getToken()
                val resp  = RetrofitClient.patientApi.uploadProfilePicture(
                    RetrofitClient.bearerToken(token),
                    mapOf("profilePicture" to base64)
                )
                if (resp.isSuccessful && resp.body()?.success == true) {
                    renderProfile(resp.body()?.data)
                    showSuccess()
                } else {
                    showError("Failed to upload picture.")
                }
            } catch (_: Exception) {
                showError("Upload failed. Check your connection.")
            }
        }
    }

    private fun showSuccess() {
        layoutSuccess.visibility = View.VISIBLE
        layoutError.visibility   = View.GONE
        view?.postDelayed({ layoutSuccess.visibility = View.GONE }, 3500)
    }

    private fun showError(msg: String) {
        tvError.text = msg
        layoutError.visibility   = View.VISIBLE
        layoutSuccess.visibility = View.GONE
    }

    private fun buildInitials(first: String, last: String): String {
        val f = first.trim().firstOrNull()?.uppercaseChar()?.toString() ?: ""
        val l = last.trim().firstOrNull()?.uppercaseChar()?.toString()  ?: ""
        return "$f$l".ifEmpty { "P" }
    }

    private fun formatDate(date: String?): String {
        if (date.isNullOrEmpty()) return ""
        return try {
            val inp = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val out = SimpleDateFormat("MMMM d, yyyy", Locale.getDefault())
            out.format(inp.parse(date)!!)
        } catch (_: Exception) { date }
    }
}