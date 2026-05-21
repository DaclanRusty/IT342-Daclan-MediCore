package com.daclan.mobile.feature.patient

import android.app.AlertDialog
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
import com.daclan.mobile.shared.network.AppointmentResponse
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class AppointmentsFragment : Fragment() {

    private lateinit var filterGroup:  LinearLayout
    private lateinit var layoutAppts:  LinearLayout
    private lateinit var progressAppts: ProgressBar
    private lateinit var layoutEmpty:  LinearLayout
    private lateinit var tvEmptyText:  TextView
    private lateinit var layoutError:  LinearLayout
    private lateinit var tvError:      TextView

    private var allAppts:     List<AppointmentResponse> = emptyList()
    private var currentFilter = "ALL"

    private val filters = listOf("ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED","REJECTED","EXPIRED")

    private val docColors = arrayOf(
        "#2563eb","#7c3aed","#059669","#f59e0b","#ef4444","#0891b2","#db2777","#16a34a"
    )
    private fun docColor(id: Long?) = docColors[((id ?: 0) % docColors.size).toInt()]

    private val statusAccent = mapOf(
        "CONFIRMED" to "#059669",
        "COMPLETED" to "#2563eb",
        "CANCELLED" to "#94a3b8",
        "REJECTED"  to "#ef4444",
        "PENDING"   to "#f59e0b",
        "EXPIRED"   to "#92400e"
    )

    data class BadgeStyle(val bgColor: String, val textColor: String, val borderColor: String)
    private val badgeStyles = mapOf(
        "PENDING"   to BadgeStyle("#fef9c3","#854d0e","#fde047"),
        "CONFIRMED" to BadgeStyle("#f0fdf4","#059669","#bbf7d0"),
        "COMPLETED" to BadgeStyle("#eff6ff","#2563eb","#bfdbfe"),
        "REJECTED"  to BadgeStyle("#fef2f2","#991b1b","#fecaca"),
        "CANCELLED" to BadgeStyle("#f1f5f9","#64748b","#cbd5e1"),
        "EXPIRED"   to BadgeStyle("#fef9c3","#854d0e","#fde047")
    )

    private fun headerGradient(status: String?): GradientDrawable {
        val (start, end) = when (status?.uppercase()) {
            "CONFIRMED" -> Pair("#059669","#047857")
            "COMPLETED" -> Pair("#2563eb","#1d4ed8")
            "CANCELLED" -> Pair("#64748b","#475569")
            "REJECTED"  -> Pair("#ef4444","#dc2626")
            "PENDING"   -> Pair("#f59e0b","#d97706")
            else        -> Pair("#64748b","#334155")
        }
        return GradientDrawable(GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor(start), Color.parseColor(end)))
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_appointments, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)
        filterGroup   = view.findViewById(R.id.filterGroup)
        layoutAppts   = view.findViewById(R.id.layoutAppointments)
        progressAppts = view.findViewById(R.id.progressAppointments)
        layoutEmpty   = view.findViewById(R.id.tvEmptyAppointments)
        tvEmptyText   = view.findViewById(R.id.tvEmptyAppointmentsText)
        layoutError   = view.findViewById(R.id.layoutErrorAppointments)
        tvError       = view.findViewById(R.id.tvErrorAppointments)
        buildFilterPills()
        loadAppointments()
    }

    private fun buildFilterPills() {
        filterGroup.removeAllViews()
        filters.forEach { f ->
            val tv = TextView(requireContext())
            tv.text     = f
            tv.textSize = 13f
            tv.setPadding(dpToPx(16), dpToPx(7), dpToPx(16), dpToPx(7))
            val isActive = f == currentFilter
            val pill = GradientDrawable().apply {
                shape        = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(100).toFloat()
                setColor(Color.parseColor(if (isActive) "#eff6ff" else "#B8FFFFFF"))
                setStroke(dpToPx(2), Color.parseColor(if (isActive) "#2563eb" else "#CCE2E8F0"))
            }
            tv.background = pill
            tv.setTextColor(Color.parseColor(if (isActive) "#2563eb" else "#64748b"))
            tv.typeface = android.graphics.Typeface.DEFAULT_BOLD
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            params.marginEnd = dpToPx(8)
            tv.layoutParams = params
            tv.setOnClickListener { currentFilter = f; buildFilterPills(); renderList() }
            filterGroup.addView(tv)
        }
    }

    private fun loadAppointments() {
        progressAppts.visibility = View.VISIBLE
        layoutAppts.removeAllViews()
        layoutEmpty.visibility = View.GONE
        layoutError.visibility = View.GONE
        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token = dashboard.getToken()
                val resp  = RetrofitClient.patientApi.getMyAppointments(RetrofitClient.bearerToken(token))
                progressAppts.visibility = View.GONE
                if (resp.isSuccessful && resp.body()?.success == true) {
                    allAppts = resp.body()?.data ?: emptyList()
                    renderList()
                } else {
                    showError(resp.body()?.errorMessage() ?: "Failed to load appointments.")
                }
            } catch (e: Exception) {
                progressAppts.visibility = View.GONE
                showError("Connection error. Check your internet.")
            }
        }
    }

    private fun showError(msg: String) {
        progressAppts.visibility = View.GONE
        tvError.text = msg
        layoutError.visibility = View.VISIBLE
    }

    private fun renderList() {
        layoutAppts.removeAllViews()
        val list = if (currentFilter == "ALL") allAppts
        else allAppts.filter { (it.status ?: "").uppercase() == currentFilter }
        if (list.isEmpty()) {
            tvEmptyText.text = if (currentFilter == "ALL") "No appointments found."
            else "No ${currentFilter.lowercase()} appointments."
            layoutEmpty.visibility = View.VISIBLE
            return
        }
        layoutEmpty.visibility = View.GONE
        list.forEachIndexed { idx, appt ->
            layoutAppts.addView(buildApptCard(appt))
            if (idx < list.size - 1) {
                val spacer = View(requireContext())
                spacer.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(10))
                layoutAppts.addView(spacer)
            }
        }
    }

    private fun buildApptCard(appt: AppointmentResponse): View {
        val card   = layoutInflater.inflate(R.layout.item_appointment_card, layoutAppts, false)
        val status = (appt.status ?: "").uppercase()
        val fn     = appt.doctor?.firstName ?: ""
        val ln     = appt.doctor?.lastName  ?: ""
        val docId  = appt.doctor?.doctorId ?: appt.doctor?.id

        card.findViewById<View>(R.id.viewAccentBorder)
            .setBackgroundColor(Color.parseColor(statusAccent[status] ?: "#94a3b8"))
        card.findViewById<TextView>(R.id.tvApptDoctorName).text = "Dr. $fn $ln".trim()
        card.findViewById<TextView>(R.id.tvApptSpec).text       = appt.doctor?.specialization ?: ""
        card.findViewById<TextView>(R.id.tvApptDate).text       = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvApptTime).text       = appt.requestedTime ?: "—"

        val tvBooked = card.findViewById<TextView>(R.id.tvBookedAt)
        if (!appt.createdAt.isNullOrEmpty()) {
            tvBooked.text = "🕐 Booked ${formatDate(appt.createdAt?.take(10))}"
            tvBooked.visibility = View.VISIBLE
        }

        val tvReason = card.findViewById<TextView>(R.id.tvApptReason)
        val reason = appt.reason ?: appt.reasonForVisit
        if (!reason.isNullOrEmpty()) {
            tvReason.text = reason
            tvReason.visibility = View.VISIBLE
        }

        val statusView = card.findViewById<TextView>(R.id.tvApptStatus)
        statusView.text = status
        applyBadgeStyle(statusView, status)

        val tvSub = card.findViewById<TextView>(R.id.tvApptSubLabel)
        val (subText, subColor) = when (status) {
            "PENDING"   -> Pair("⏳ Awaiting confirmation", "#f59e0b")
            "CONFIRMED" -> Pair("✓ Confirmed",              "#059669")
            "COMPLETED" -> Pair("📋 ${if (!appt.doctorNotes.isNullOrEmpty()) "Has notes" else "View summary"}", "#2563eb")
            "CANCELLED" -> Pair("✕ ${if (!appt.cancelReason.isNullOrEmpty()) "Has reason" else "Cancelled"}", "#64748b")
            "REJECTED"  -> Pair("✕ Not approved",           "#ef4444")
            "EXPIRED"   -> Pair("⏰ Auto-expired",           "#92400e")
            else        -> Pair("", "")
        }
        if (subText.isNotEmpty()) {
            tvSub.text = subText
            tvSub.setTextColor(Color.parseColor(subColor))
            tvSub.visibility = View.VISIBLE
        }

        val tvInitials = card.findViewById<TextView>(R.id.tvDoctorInitials)
        tvInitials.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(docId)))
        }
        tvInitials.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val ivPic = card.findViewById<ImageView>(R.id.ivDoctorPic)
        if (!appt.doctor?.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(appt.doctor!!.profilePicture!!.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility      = View.VISIBLE
                tvInitials.visibility = View.GONE
            } catch (_: Exception) { }
        }

        card.setOnClickListener { showApptDetail(appt) }
        return card
    }

    private fun showApptDetail(appt: AppointmentResponse) {
        val status = (appt.status ?: "").uppercase()
        val fn     = appt.doctor?.firstName ?: ""
        val ln     = appt.doctor?.lastName  ?: ""
        val docId  = appt.doctor?.doctorId ?: appt.doctor?.id

        val dialogView = layoutInflater.inflate(R.layout.dialog_appointment_detail, null)

        dialogView.findViewById<LinearLayout>(R.id.layoutDetailHeader)
            .background = headerGradient(status)

        val tvInit = dialogView.findViewById<TextView>(R.id.tvDetailInitials)
        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(docId)))
        }
        tvInit.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val ivPic = dialogView.findViewById<ImageView>(R.id.ivDetailDoctorPic)
        if (!appt.doctor?.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(appt.doctor!!.profilePicture!!.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility = View.VISIBLE
                tvInit.visibility = View.GONE
            } catch (_: Exception) { }
        }

        dialogView.findViewById<TextView>(R.id.tvDetailDoctorName).text = "Dr. $fn $ln".trim()
        dialogView.findViewById<TextView>(R.id.tvDetailSpec).text =
            appt.doctor?.specialization ?: "General Practitioner"
        dialogView.findViewById<TextView>(R.id.tvDetailStatus).text = status

        val pillBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor("#33FFFFFF"))
        }
        (dialogView.findViewById<LinearLayout>(R.id.layoutDetailHeader)
            .getChildAt(1) as? LinearLayout)?.background = pillBg

        dialogView.findViewById<TextView>(R.id.tvDetailDate).text = formatDateLong(appt.requestedDate)
        dialogView.findViewById<TextView>(R.id.tvDetailTime).text = appt.requestedTime ?: "—"

        val reason = appt.reason ?: appt.reasonForVisit
        val reasonSection = dialogView.findViewById<LinearLayout>(R.id.layoutDetailReasonSection)
        if (!reason.isNullOrEmpty()) {
            dialogView.findViewById<TextView>(R.id.tvDetailReason).text = reason
            reasonSection.visibility = View.VISIBLE
        }

        val tvBookedAt = dialogView.findViewById<TextView>(R.id.tvDetailBookedAt)
        if (!appt.createdAt.isNullOrEmpty()) {
            tvBookedAt.text = "Booked: ${formatDateTime(appt.createdAt)}"
        }

        // COMPLETED
        if (status == "COMPLETED") {
            val notesSection = dialogView.findViewById<LinearLayout>(R.id.layoutDetailNotes)
            notesSection.visibility = View.VISIBLE
            val tvNotes = dialogView.findViewById<TextView>(R.id.tvDetailNotes)
            if (!appt.doctorNotes.isNullOrEmpty()) {
                tvNotes.text = appt.doctorNotes
            } else {
                tvNotes.text = "No notes were added for this consultation."
                tvNotes.setTextColor(Color.parseColor("#3B82F6"))
            }
            if (!appt.completedAt.isNullOrEmpty()) {
                val tv = dialogView.findViewById<TextView>(R.id.tvDetailCompletedAt)
                tv.text = "Completed on ${formatDateLong(appt.completedAt!!.take(10))}"
                tv.visibility = View.VISIBLE
            }
        }

        // CANCELLED
        if (status == "CANCELLED") {
            val cancelSection = dialogView.findViewById<LinearLayout>(R.id.layoutDetailCancel)
            cancelSection.visibility = View.VISIBLE
            val cancelInfo = getCancelledByStyle(appt.cancelledBy)
            cancelSection.background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(14).toFloat()
                setColor(Color.parseColor(cancelInfo.bg))
                setStroke(dpToPx(2), Color.parseColor(cancelInfo.border))
            }
            dialogView.findViewById<TextView>(R.id.tvCancelTitle)
                .setTextColor(Color.parseColor(cancelInfo.color))
            dialogView.findViewById<TextView>(R.id.tvCancelledBy).apply {
                text = cancelInfo.label
                setTextColor(Color.parseColor(cancelInfo.color))
            }
            dialogView.findViewById<TextView>(R.id.tvDetailCancelReason).apply {
                text = if (!appt.cancelReason.isNullOrEmpty()) appt.cancelReason
                else "No reason was provided."
                setTextColor(Color.parseColor(cancelInfo.color))
            }
            if (!appt.cancelledAt.isNullOrEmpty()) {
                val tv = dialogView.findViewById<TextView>(R.id.tvDetailCancelledAt)
                tv.text = "Cancelled on ${formatDateLong(appt.cancelledAt!!.take(10))}"
                tv.setTextColor(Color.parseColor(cancelInfo.color))
                tv.visibility = View.VISIBLE
            }
        }

        // REJECTED
        if (status == "REJECTED") {
            val rejectSection = dialogView.findViewById<LinearLayout>(R.id.layoutDetailReject)
            rejectSection.visibility = View.VISIBLE
            val rejectReason = appt.rejectedReason ?: appt.rejectReason
            dialogView.findViewById<TextView>(R.id.tvDetailRejectReason).text =
                if (!rejectReason.isNullOrEmpty()) rejectReason else "No reason was provided."
            if (!appt.rejectedAt.isNullOrEmpty()) {
                val tv = dialogView.findViewById<TextView>(R.id.tvDetailRejectedAt)
                tv.text = "Rejected on ${formatDateLong(appt.rejectedAt!!.take(10))}"
                tv.visibility = View.VISIBLE
            }
        }

        if (status == "CONFIRMED") {
            dialogView.findViewById<LinearLayout>(R.id.layoutDetailConfirmed).visibility = View.VISIBLE
        }
        if (status == "PENDING") {
            dialogView.findViewById<LinearLayout>(R.id.layoutDetailPending).visibility = View.VISIBLE
        }

        AlertDialog.Builder(requireContext(), R.style.MedicoreDialog)
            .setView(dialogView)
            .setPositiveButton("Close") { d, _ -> d.dismiss() }
            .show()
    }

    data class CancelStyle(val label: String, val color: String, val bg: String, val border: String)
    private fun getCancelledByStyle(cancelledBy: String?): CancelStyle = when (cancelledBy?.uppercase()) {
        "PATIENT"   -> CancelStyle("Cancelled by you",      "#64748b","#f1f5f9","#cbd5e1")
        "DOCTOR"    -> CancelStyle("Cancelled by doctor",   "#dc2626","#fef2f2","#fecaca")
        "SECRETARY" -> CancelStyle("Cancelled by clinic",   "#d97706","#fffbeb","#fde68a")
        else        -> CancelStyle("Appointment cancelled", "#64748b","#f1f5f9","#cbd5e1")
    }

    private fun applyBadgeStyle(view: TextView, status: String) {
        val s = badgeStyles[status] ?: badgeStyles["PENDING"]!!
        view.background = GradientDrawable().apply {
            shape        = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(s.bgColor))
            setStroke(dpToPx(1), Color.parseColor(s.borderColor))
        }
        view.setTextColor(Color.parseColor(s.textColor))
    }

    private fun formatDate(date: String?): String {
        if (date.isNullOrEmpty()) return "—"
        return try {
            val inp = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val out = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
            out.format(inp.parse(date)!!)
        } catch (_: Exception) { date }
    }

    private fun formatDateLong(date: String?): String {
        if (date.isNullOrEmpty()) return "—"
        return try {
            val inp = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val out = SimpleDateFormat("EEE, MMM d, yyyy", Locale.getDefault())
            out.format(inp.parse(date)!!)
        } catch (_: Exception) { date }
    }

    private fun formatDateTime(dt: String?): String {
        if (dt.isNullOrEmpty()) return "—"
        return try {
            val inp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val out = SimpleDateFormat("MMM d, yyyy h:mm a", Locale.getDefault())
            out.format(inp.parse(dt.substring(0, minOf(19, dt.length)))!!)
        } catch (_: Exception) { dt }
    }

    private fun dpToPx(dp: Int): Int =
        (dp * resources.displayMetrics.density).toInt()
}