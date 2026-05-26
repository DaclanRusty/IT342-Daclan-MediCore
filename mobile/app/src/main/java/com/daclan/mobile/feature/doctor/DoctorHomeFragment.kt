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
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.DoctorAppointmentResponse
import com.daclan.mobile.shared.network.DoctorCache
import java.text.SimpleDateFormat
import java.util.*

class DoctorHomeFragment : Fragment() {

    private lateinit var tvWelcome:       TextView
    private lateinit var tvStatToday:     TextView
    private lateinit var tvStatTotal:     TextView
    private lateinit var tvStatCompleted: TextView
    private lateinit var tvStatConfirmed: TextView
    private lateinit var progressAppts:   ProgressBar
    private lateinit var layoutEmpty:     LinearLayout
    private lateinit var layoutCards:     LinearLayout
    private lateinit var btnViewAll:      TextView
    private lateinit var tvSecretaryName: TextView
    private lateinit var tvSecretaryEmail:TextView
    private lateinit var tvSecretaryInitials: TextView
    private lateinit var layoutSecretaryAssigned: LinearLayout
    private lateinit var layoutSecretaryEmpty: LinearLayout

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctor_home, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        tvWelcome       = view.findViewById(R.id.tvDoctorWelcome)
        tvStatToday     = view.findViewById(R.id.tvStatToday)
        tvStatTotal     = view.findViewById(R.id.tvStatTotalDoctor)
        tvStatCompleted = view.findViewById(R.id.tvStatCompletedDoctor)
        tvStatConfirmed = view.findViewById(R.id.tvStatConfirmedDoctor)
        progressAppts   = view.findViewById(R.id.progressDoctorHome)
        layoutEmpty     = view.findViewById(R.id.layoutDoctorHomeEmpty)
        layoutCards     = view.findViewById(R.id.layoutDoctorRecentCards)
        btnViewAll      = view.findViewById(R.id.btnDoctorViewAll)

        tvSecretaryName     = view.findViewById(R.id.tvSecretaryName)
        tvSecretaryEmail    = view.findViewById(R.id.tvSecretaryEmail)
        tvSecretaryInitials = view.findViewById(R.id.tvSecretaryInitials)
        layoutSecretaryAssigned = view.findViewById(R.id.layoutSecretaryAssigned)
        layoutSecretaryEmpty    = view.findViewById(R.id.layoutSecretaryEmpty)

        val dashboard = activity as? DoctorDashboardActivity
        tvWelcome.text = "Welcome, Dr. ${dashboard?.getFirstName() ?: ""}!"

        btnViewAll.setOnClickListener { dashboard?.switchTab("appointments") }

        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return

        // Update welcome name
        if (DoctorCache.profileLoaded) {
            val fn = DoctorCache.profile?.firstName ?: ""
            tvWelcome.text = "Welcome, Dr. $fn!"
        }

        if (DoctorCache.appointmentsLoaded) {
            progressAppts.visibility = View.GONE
            updateStats(DoctorCache.appointments)
            renderRecentCards(DoctorCache.appointments)
        } else {
            progressAppts.visibility = View.VISIBLE
        }

        if (DoctorCache.secretaryLoaded) {
            updateSecretarySection()
        }
    }

    private fun updateStats(all: List<DoctorAppointmentResponse>) {
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        tvStatToday.text     = all.count { it.requestedDate == todayStr }.toString()
        tvStatTotal.text     = all.size.toString()
        tvStatCompleted.text = all.count { it.status?.uppercase() == "COMPLETED" }.toString()
        tvStatConfirmed.text = all.count { it.status?.uppercase() == "CONFIRMED" }.toString()
    }

    private fun updateSecretarySection() {
        val assigned = DoctorCache.secretaryRequests
            .firstOrNull { it.status?.uppercase() == "APPROVED" }

        if (assigned != null) {
            layoutSecretaryAssigned.visibility = View.VISIBLE
            layoutSecretaryEmpty.visibility    = View.GONE
            val fn = assigned.firstName ?: ""
            val ln = assigned.lastName  ?: ""
            tvSecretaryName.text  = "$fn $ln".trim()
            tvSecretaryEmail.text = assigned.email ?: ""
            tvSecretaryInitials.text =
                "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
        } else {
            layoutSecretaryAssigned.visibility = View.GONE
            layoutSecretaryEmpty.visibility    = View.VISIBLE
        }
    }

    private fun renderRecentCards(all: List<DoctorAppointmentResponse>) {
        layoutCards.removeAllViews()
        val recent = all.take(4)
        if (recent.isEmpty()) {
            layoutEmpty.visibility = View.VISIBLE
            return
        }
        layoutEmpty.visibility = View.GONE

        recent.chunked(2).forEach { pair ->
            val row = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).also { it.bottomMargin = dpToPx(10) }
            }
            pair.forEachIndexed { index, appt ->
                val wrap = LinearLayout(requireContext()).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
                    ).also {
                        if (index == 0) it.marginEnd   = dpToPx(6)
                        else            it.marginStart = dpToPx(6)
                    }
                }
                wrap.addView(buildApptCard(appt))
                row.addView(wrap)
            }
            if (pair.size == 1) {
                row.addView(View(requireContext()).apply {
                    layoutParams = LinearLayout.LayoutParams(0,
                        LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                })
            }
            layoutCards.addView(row)
        }
    }

    private fun buildApptCard(appt: DoctorAppointmentResponse): View {
        val card = layoutInflater.inflate(R.layout.item_doctor_appt_card, layoutCards, false)
        val fn   = appt.patient?.firstName ?: ""
        val ln   = appt.patient?.lastName  ?: ""
        val status = (appt.status ?: "").uppercase()

        card.findViewById<TextView>(R.id.tvDoctorCardPatientName).text = "$fn $ln".trim()
        card.findViewById<TextView>(R.id.tvDoctorCardReason).text      = appt.resolvedReason() ?: "—"
        card.findViewById<TextView>(R.id.tvDoctorCardDate).text        = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvDoctorCardTime).text        = appt.requestedTime ?: "—"

        val tvStatus = card.findViewById<TextView>(R.id.tvDoctorCardStatus)
        tvStatus.text = status
        applyBadge(tvStatus, status)

        val tvInit = card.findViewById<TextView>(R.id.tvDoctorCardInitials)
        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#059669"))
        }
        tvInit.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val ivPic = card.findViewById<ImageView>(R.id.ivDoctorCardPic)
        if (!appt.patient?.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(appt.patient!!.profilePicture!!.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility  = View.VISIBLE
                tvInit.visibility = View.GONE
            } catch (_: Exception) {}
        }

        return card
    }

    private fun applyBadge(view: TextView, status: String) {
        val (bg, text, border) = when (status) {
            "CONFIRMED" -> Triple("#f0fdf4","#059669","#bbf7d0")
            "COMPLETED" -> Triple("#eff6ff","#2563eb","#bfdbfe")
            "CANCELLED" -> Triple("#f1f5f9","#64748b","#cbd5e1")
            "PENDING"   -> Triple("#fef9c3","#854d0e","#fde047")
            else        -> Triple("#fef9c3","#854d0e","#fde047")
        }
        view.background = GradientDrawable().apply {
            shape        = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(bg))
            setStroke(dpToPx(1), Color.parseColor(border))
        }
        view.setTextColor(Color.parseColor(text))
    }

    private fun formatDate(date: String?): String {
        if (date.isNullOrEmpty()) return "—"
        return try {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val out = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
            out.format(sdf.parse(date)!!)
        } catch (_: Exception) { date }
    }

    private fun dpToPx(dp: Int) = (dp * resources.displayMetrics.density).toInt()
}