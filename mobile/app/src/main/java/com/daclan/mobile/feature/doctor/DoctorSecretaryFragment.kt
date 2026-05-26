package com.daclan.mobile.feature.doctor

import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.util.Base64
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.DoctorCache
import com.daclan.mobile.shared.network.RetrofitClient
import com.daclan.mobile.shared.network.SecretaryRequest
import kotlinx.coroutines.launch

class DoctorSecretaryFragment : Fragment() {

    private lateinit var layoutRequests:   LinearLayout
    private lateinit var progressSecretary: ProgressBar
    private lateinit var layoutEmpty:      LinearLayout
    private lateinit var layoutAssigned:   LinearLayout

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctor_secretary, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)
        layoutRequests    = view.findViewById(R.id.layoutSecretaryRequests)
        progressSecretary = view.findViewById(R.id.progressSecretary)
        layoutEmpty       = view.findViewById(R.id.layoutSecretaryListEmpty)
        layoutAssigned    = view.findViewById(R.id.layoutAlreadyAssigned)
        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (DoctorCache.secretaryLoaded) {
            progressSecretary.visibility = View.GONE
            renderRequests(DoctorCache.secretaryRequests)
        } else {
            progressSecretary.visibility = View.VISIBLE
        }
    }

    private fun renderRequests(list: List<SecretaryRequest>) {
        if (!isAdded) return
        layoutRequests.removeAllViews()

        val hasApproved = list.any { it.status?.uppercase() == "APPROVED" }
        layoutAssigned.visibility = if (hasApproved) View.VISIBLE else View.GONE

        if (list.isEmpty()) { layoutEmpty.visibility = View.VISIBLE; return }
        layoutEmpty.visibility = View.GONE

        list.forEachIndexed { idx, req ->
            layoutRequests.addView(buildSecretaryCard(req, hasApproved))
            if (idx < list.size - 1) {
                val spacer = View(requireContext())
                spacer.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(10))
                layoutRequests.addView(spacer)
            }
        }
    }

    private fun buildSecretaryCard(req: SecretaryRequest, hasApproved: Boolean): View {
        val card = layoutInflater.inflate(R.layout.item_secretary_card, layoutRequests, false)
        val fn   = req.firstName ?: ""
        val ln   = req.lastName  ?: ""
        val status = (req.status ?: "").uppercase()

        card.findViewById<TextView>(R.id.tvSecCardName).text  = "$fn $ln".trim()
        card.findViewById<TextView>(R.id.tvSecCardEmail).text = req.email ?: ""

        val tvPhone = card.findViewById<TextView>(R.id.tvSecCardPhone)
        if (!req.phoneNumber.isNullOrEmpty()) {
            tvPhone.text = req.phoneNumber; tvPhone.visibility = View.VISIBLE
        }

        val tvStatus = card.findViewById<TextView>(R.id.tvSecCardStatus)
        tvStatus.text = status
        val (bg, text, border) = when (status) {
            "APPROVED" -> Triple("#f0fdf4","#059669","#bbf7d0")
            "PENDING"  -> Triple("#fef9c3","#854d0e","#fde047")
            "REJECTED" -> Triple("#fef2f2","#991b1b","#fecaca")
            else       -> Triple("#f1f5f9","#64748b","#cbd5e1")
        }
        tvStatus.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE; cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(bg)); setStroke(dpToPx(1), Color.parseColor(border))
        }
        tvStatus.setTextColor(Color.parseColor(text))

        // Avatar initials
        val tvInit = card.findViewById<TextView>(R.id.tvSecCardInitials)
        tvInit.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL; setColor(Color.parseColor("#7C3AED"))
        }

        // Profile pic
        val ivPic = card.findViewById<ImageView>(R.id.ivSecCardPic)
        if (!req.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(req.profilePicture.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility  = View.VISIBLE
                tvInit.visibility = View.GONE
            } catch (_: Exception) {}
        }

        // Approve / Reject buttons
        val btnLayout  = card.findViewById<LinearLayout>(R.id.layoutSecCardActions)
        val btnApprove = card.findViewById<Button>(R.id.btnApproveSecretary)
        val btnReject  = card.findViewById<Button>(R.id.btnRejectSecretary)

        if (status == "PENDING" && !hasApproved) {
            btnLayout.visibility = View.VISIBLE
            btnApprove.setOnClickListener { performApprove(req.secretaryId ?: return@setOnClickListener) }
            btnReject.setOnClickListener  { performReject(req.secretaryId  ?: return@setOnClickListener) }
        } else {
            btnLayout.visibility = View.GONE
        }

        return card
    }

    private fun performApprove(secretaryId: Long) {
        lifecycleScope.launch {
            try {
                val dashboard = activity as? DoctorDashboardActivity ?: return@launch
                val resp = RetrofitClient.doctorApi.approveSecretary(
                    RetrofitClient.bearerToken(dashboard.getToken()), secretaryId)
                if (resp.isSuccessful) {
                    Toast.makeText(requireContext(), "Secretary approved!", Toast.LENGTH_SHORT).show()
                    dashboard.refreshData()
                }
            } catch (_: Exception) {
                Toast.makeText(requireContext(), "Failed.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performReject(secretaryId: Long) {
        lifecycleScope.launch {
            try {
                val dashboard = activity as? DoctorDashboardActivity ?: return@launch
                val resp = RetrofitClient.doctorApi.rejectSecretary(
                    RetrofitClient.bearerToken(dashboard.getToken()), secretaryId)
                if (resp.isSuccessful) {
                    Toast.makeText(requireContext(), "Request rejected.", Toast.LENGTH_SHORT).show()
                    dashboard.refreshData()
                }
            } catch (_: Exception) {
                Toast.makeText(requireContext(), "Failed.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun dpToPx(dp: Int) = (dp * resources.displayMetrics.density).toInt()
}