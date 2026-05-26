package com.daclan.mobile.feature.secretary

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
import com.daclan.mobile.shared.network.RetrofitClient
import com.daclan.mobile.shared.network.SecretaryDataCache
import com.daclan.mobile.shared.network.SecretaryProfileUpdateRequest
import kotlinx.coroutines.launch

class SecretaryProfileFragment : Fragment() {

    // View mode
    private lateinit var layoutViewMode:   LinearLayout
    private lateinit var tvProfileName:    TextView
    private lateinit var tvProfileEmail:   TextView
    private lateinit var tvProfilePhone:   TextView
    private lateinit var tvProfileStatus:  TextView
    private lateinit var ivProfileAvatar:  android.widget.ImageView
    private lateinit var tvProfileInitials: TextView
    private lateinit var btnEditProfile:   Button
    private lateinit var tvProfileEmailInfo: TextView

    // Edit mode
    private lateinit var layoutEditMode:   LinearLayout
    private lateinit var etFirstName:      EditText
    private lateinit var etLastName:       EditText
    private lateinit var etPhone:          EditText
    private lateinit var tvEditEmail:      TextView
    private lateinit var btnSaveProfile:   Button
    private lateinit var btnCancelEdit:    Button
    private lateinit var progressSave:     ProgressBar
    private lateinit var tvSaveError:      TextView

    // Doctor section
    private lateinit var layoutDoctorSection: LinearLayout
    private lateinit var tvAssignedDoctorName: TextView
    private lateinit var tvAssignedDoctorSpec: TextView
    private lateinit var tvAssignedDoctorInitials: TextView
    private lateinit var ivAssignedDoctorPic: android.widget.ImageView

    // Loading
    private lateinit var progressProfile: ProgressBar

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_secretary_profile, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        progressProfile       = view.findViewById(R.id.progressSecProfile)
        layoutViewMode        = view.findViewById(R.id.layoutSecProfileView)
        tvProfileName         = view.findViewById(R.id.tvSecProfileName)
        tvProfileEmail        = view.findViewById(R.id.tvSecProfileEmail)
        tvProfilePhone        = view.findViewById(R.id.tvSecProfilePhone)
        tvProfileStatus       = view.findViewById(R.id.tvSecProfileStatus)
        ivProfileAvatar       = view.findViewById(R.id.ivSecProfileAvatar)
        tvProfileInitials     = view.findViewById(R.id.tvSecProfileInitials)
        btnEditProfile        = view.findViewById(R.id.btnSecEditProfile)
        tvProfileEmailInfo    = view.findViewById(R.id.tvSecProfileEmailInfo)

        layoutEditMode        = view.findViewById(R.id.layoutSecProfileEdit)
        etFirstName           = view.findViewById(R.id.etSecFirstName)
        etLastName            = view.findViewById(R.id.etSecLastName)
        etPhone               = view.findViewById(R.id.etSecPhone)
        tvEditEmail           = view.findViewById(R.id.tvSecEditEmail)
        btnSaveProfile        = view.findViewById(R.id.btnSecSaveProfile)
        btnCancelEdit         = view.findViewById(R.id.btnSecCancelEdit)
        progressSave          = view.findViewById(R.id.progressSecSave)
        tvSaveError           = view.findViewById(R.id.tvSecSaveError)

        layoutDoctorSection      = view.findViewById(R.id.layoutSecAssignedDoctor)
        tvAssignedDoctorName     = view.findViewById(R.id.tvSecAssignedDoctorName)
        tvAssignedDoctorSpec     = view.findViewById(R.id.tvSecAssignedDoctorSpec)
        tvAssignedDoctorInitials = view.findViewById(R.id.tvSecAssignedDoctorInitials)
        ivAssignedDoctorPic      = view.findViewById(R.id.ivSecAssignedDoctorPic)

        btnEditProfile.setOnClickListener { switchToEditMode() }

        btnCancelEdit.setOnClickListener {
            switchToViewMode()
            tvSaveError.visibility = View.GONE
        }

        btnSaveProfile.setOnClickListener { handleSave() }

        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (!::progressProfile.isInitialized) return

        if (SecretaryDataCache.profileLoaded) {
            progressProfile.visibility = View.GONE
            renderProfile()
        } else {
            progressProfile.visibility = View.VISIBLE
            layoutViewMode.visibility  = View.GONE
        }
    }

    private fun renderProfile() {
        val profile = SecretaryDataCache.profile ?: return
        layoutViewMode.visibility = View.VISIBLE

        val fn = profile.firstName ?: ""
        val ln = profile.lastName  ?: ""

        tvProfileName.text      = "$fn $ln".trim().ifEmpty { "Secretary" }
        tvProfileEmail.text     = profile.email ?: "—"
        tvProfileEmailInfo.text = profile.email ?: "—"   // ← THIS was missing
        tvProfilePhone.text     = profile.phoneNumber?.ifEmpty { "Not provided" } ?: "Not provided"
        tvProfileStatus.text    = profile.status ?: "PENDING"

        tvProfileInitials.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}".ifEmpty { "S" }

        val pic = profile.profilePicture
        if (!pic.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(pic.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivProfileAvatar.setImageBitmap(bitmap)
                ivProfileAvatar.visibility   = View.VISIBLE
                tvProfileInitials.visibility = View.GONE
            } catch (_: Exception) {
                ivProfileAvatar.visibility   = View.GONE
                tvProfileInitials.visibility = View.VISIBLE
            }
        }

        // Assigned doctor
        val doc = profile.assignedDoctor
        if (doc != null) {
            layoutDoctorSection.visibility = View.VISIBLE
            val dfn = doc.firstName ?: ""
            val dln = doc.lastName  ?: ""
            tvAssignedDoctorName.text     = "Dr. $dfn $dln".trim()
            tvAssignedDoctorSpec.text     = doc.specialization ?: "General Practitioner"
            tvAssignedDoctorInitials.text = "${dfn.firstOrNull()?.uppercaseChar() ?: ""}${dln.firstOrNull()?.uppercaseChar() ?: ""}"

            val docPic = doc.profilePicture
            if (!docPic.isNullOrEmpty()) {
                try {
                    val bytes  = Base64.decode(docPic.substringAfter(","), Base64.DEFAULT)
                    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    ivAssignedDoctorPic.setImageBitmap(bitmap)
                    ivAssignedDoctorPic.visibility      = View.VISIBLE
                    tvAssignedDoctorInitials.visibility = View.GONE
                } catch (_: Exception) {}
            }
        }
    }

    private fun switchToEditMode() {
        val profile = SecretaryDataCache.profile ?: return
        etFirstName.setText(profile.firstName ?: "")
        etLastName.setText(profile.lastName   ?: "")
        etPhone.setText(profile.phoneNumber   ?: "")
        tvEditEmail.text = profile.email ?: ""
        tvSaveError.visibility = View.GONE

        layoutViewMode.visibility = View.GONE
        layoutEditMode.visibility = View.VISIBLE
    }

    private fun switchToViewMode() {
        layoutEditMode.visibility = View.GONE
        layoutViewMode.visibility = View.VISIBLE
    }

    private fun handleSave() {
        val fn    = etFirstName.text.toString().trim()
        val ln    = etLastName.text.toString().trim()
        val phone = etPhone.text.toString().trim()

        if (fn.isEmpty() || ln.isEmpty()) {
            tvSaveError.text       = "First and last name are required."
            tvSaveError.visibility = View.VISIBLE
            return
        }

        tvSaveError.visibility   = View.GONE
        progressSave.visibility  = View.VISIBLE
        btnSaveProfile.isEnabled = false

        lifecycleScope.launch {
            try {
                val token = (activity as? SecretaryDashboardActivity)?.getToken() ?: ""
                val resp  = RetrofitClient.secretaryApi.updateProfile(
                    RetrofitClient.bearerToken(token),
                    SecretaryProfileUpdateRequest(fn, ln, phone)
                )
                if (resp.isSuccessful && resp.body()?.success == true) {
                    SecretaryDataCache.profile = resp.body()?.data
                    switchToViewMode()
                    renderProfile()
                    (activity as? SecretaryDashboardActivity)?.apply {
                        val p = SecretaryDataCache.profile
                        updateNavAvatar(p?.profilePicture)
                    }
                    Toast.makeText(requireContext(), "Profile updated!", Toast.LENGTH_SHORT).show()
                } else {
                    tvSaveError.text       = "Failed to save. Try again."
                    tvSaveError.visibility = View.VISIBLE
                }
            } catch (_: Exception) {
                tvSaveError.text       = "Connection error. Try again."
                tvSaveError.visibility = View.VISIBLE
            } finally {
                progressSave.visibility  = View.GONE
                btnSaveProfile.isEnabled = true
            }
        }
    }
}