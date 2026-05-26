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
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.AppointmentResponse
import com.daclan.mobile.shared.network.DataCache
import java.text.SimpleDateFormat
import java.util.*

class AppointmentsFragment : Fragment() {

    private lateinit var filterGroup: LinearLayout
    private lateinit var layoutAppts: LinearLayout
    private lateinit var progressAppts: ProgressBar
    private lateinit var layoutEmpty: LinearLayout
    private lateinit var tvEmptyText: TextView
    private lateinit var layoutError: LinearLayout
    private lateinit var tvError: TextView

    private var currentFilter = "ALL"
    private val filters = listOf("ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "EXPIRED")

    private val docColors = arrayOf(
        "#2563eb", "#7c3aed", "#059669", "#f59e0b",
        "#ef4444", "#0891b2", "#db2777", "#16a34a"
    )

    private fun docColor(id: Long?) =
        docColors[((id ?: 0L) % docColors.size).toInt()]

    private val statusAccent = mapOf(
        "CONFIRMED" to "#059669",
        "COMPLETED" to "#2563eb",
        "CANCELLED" to "#94a3b8",
        "REJECTED" to "#ef4444",
        "PENDING" to "#f59e0b",
        "EXPIRED" to "#92400e"
    )

    data class BadgeStyle(val bgColor: String, val textColor: String, val borderColor: String)

    private val badgeStyles = mapOf(
        "PENDING" to BadgeStyle("#fef9c3", "#854d0e", "#fde047"),
        "CONFIRMED" to BadgeStyle("#f0fdf4", "#059669", "#bbf7d0"),
        "COMPLETED" to BadgeStyle("#eff6ff", "#2563eb", "#bfdbfe"),
        "REJECTED" to BadgeStyle("#fef2f2", "#991b1b", "#fecaca"),
        "CANCELLED" to BadgeStyle("#f1f5f9", "#64748b", "#cbd5e1"),
        "EXPIRED" to BadgeStyle("#fef9c3", "#854d0e", "#fde047")
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        saved: Bundle?
    ): View = inflater.inflate(R.layout.fragment_appointments, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        filterGroup = view.findViewById(R.id.filterGroup)
        layoutAppts = view.findViewById(R.id.layoutAppointments)
        progressAppts = view.findViewById(R.id.progressAppointments)
        layoutEmpty = view.findViewById(R.id.tvEmptyAppointments)
        tvEmptyText = view.findViewById(R.id.tvEmptyAppointmentsText)
        layoutError = view.findViewById(R.id.layoutErrorAppointments)
        tvError = view.findViewById(R.id.tvErrorAppointments)

        buildFilterPills()
        loadFromCache()
    }

    override fun onResume() {
        super.onResume()
        if (DataCache.appointmentsLoaded) {
            loadFromCache()
        }
    }

    fun loadFromCache() {
        if (!isAdded || view == null) return
        if (!::progressAppts.isInitialized) return

        if (DataCache.appointmentsLoaded) {
            progressAppts.visibility = View.GONE
            layoutError.visibility = View.GONE
            renderList()
        } else {
            progressAppts.visibility = View.VISIBLE
            layoutEmpty.visibility = View.GONE
            layoutError.visibility = View.GONE
        }
    }

    private fun buildFilterPills() {
        filterGroup.removeAllViews()

        filters.forEach { filter ->
            val tv = TextView(requireContext())
            val isActive = filter == currentFilter

            tv.text = filter
            tv.textSize = 12f
            tv.typeface = android.graphics.Typeface.DEFAULT_BOLD
            tv.setPadding(dpToPx(14), dpToPx(6), dpToPx(14), dpToPx(6))
            tv.setTextColor(Color.parseColor(if (isActive) "#2563eb" else "#64748b"))

            tv.background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(100).toFloat()
                setColor(Color.parseColor(if (isActive) "#eff6ff" else "#F8FAFC"))
                setStroke(dpToPx(2), Color.parseColor(if (isActive) "#2563eb" else "#E2E8F0"))
            }

            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.marginEnd = dpToPx(6)
            tv.layoutParams = params

            tv.setOnClickListener {
                currentFilter = filter
                buildFilterPills()
                renderList()
            }

            filterGroup.addView(tv)
        }
    }

    private fun renderList() {
        layoutAppts.removeAllViews()

        val all = DataCache.appointments
        val list = if (currentFilter == "ALL") {
            all
        } else {
            all.filter { (it.status ?: "").uppercase() == currentFilter }
        }

        if (list.isEmpty()) {
            tvEmptyText.text = if (currentFilter == "ALL") {
                "No appointments found."
            } else {
                "No ${currentFilter.lowercase()} appointments."
            }
            layoutEmpty.visibility = View.VISIBLE
            return
        }

        layoutEmpty.visibility = View.GONE

        list.forEachIndexed { index, appt ->
            layoutAppts.addView(buildApptCard(appt))

            if (index < list.size - 1) {
                val spacer = View(requireContext())
                spacer.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    dpToPx(10)
                )
                layoutAppts.addView(spacer)
            }
        }
    }

    private fun buildApptCard(appt: AppointmentResponse): View {
        val card = layoutInflater.inflate(R.layout.item_appointment_card, layoutAppts, false)

        val status = (appt.status ?: "").uppercase()
        val apptDoctor = appt.doctor
        val doctorId = apptDoctor?.doctorId

        val cachedDoctor = DataCache.doctors.firstOrNull {
            it.doctorId == doctorId
        }

        val fn = apptDoctor?.firstName ?: cachedDoctor?.firstName ?: ""
        val ln = apptDoctor?.lastName ?: cachedDoctor?.lastName ?: ""
        val spec = apptDoctor?.specialization ?: cachedDoctor?.specialization ?: "General Practitioner"
        val profilePic = apptDoctor?.profilePicture ?: cachedDoctor?.profilePicture

        card.findViewById<View>(R.id.viewAccentBorder)
            .setBackgroundColor(Color.parseColor(statusAccent[status] ?: "#94a3b8"))

        card.findViewById<TextView>(R.id.tvApptDoctorName).text =
            "Dr. $fn $ln".trim().ifEmpty { "Doctor" }

        card.findViewById<TextView>(R.id.tvApptSpec).text = spec
        card.findViewById<TextView>(R.id.tvApptDate).text = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvApptTime).text = appt.requestedTime ?: "—"

        val tvBooked = card.findViewById<TextView>(R.id.tvBookedAt)
        if (!appt.createdAt.isNullOrEmpty()) {
            tvBooked.text = "🕐 Booked ${formatDate(appt.createdAt?.take(10))}"
            tvBooked.visibility = View.VISIBLE
        }

        val reason = appt.reason ?: appt.reasonForVisit
        val tvReason = card.findViewById<TextView>(R.id.tvApptReason)
        if (!reason.isNullOrEmpty()) {
            tvReason.text = reason
            tvReason.visibility = View.VISIBLE
        }

        val statusView = card.findViewById<TextView>(R.id.tvApptStatus)
        statusView.text = status
        applyBadgeStyle(statusView, status)

        val tvSub = card.findViewById<TextView>(R.id.tvApptSubLabel)
        val (subText, subColor) = when (status) {
            "PENDING" -> Pair("⏳ Awaiting confirmation", "#f59e0b")
            "CONFIRMED" -> Pair("✓ Confirmed", "#059669")
            "COMPLETED" -> Pair("📋 View summary", "#2563eb")
            "CANCELLED" -> Pair("✕ Cancelled", "#64748b")
            "REJECTED" -> Pair("✕ Not approved", "#ef4444")
            "EXPIRED" -> Pair("⏰ Auto-expired", "#92400e")
            else -> Pair("", "")
        }

        if (subText.isNotEmpty()) {
            tvSub.text = subText
            tvSub.setTextColor(Color.parseColor(subColor))
            tvSub.visibility = View.VISIBLE
        }

        val tvInitials = card.findViewById<TextView>(R.id.tvDoctorInitials)
        val ivPic = card.findViewById<ImageView>(R.id.ivDoctorPic)

        tvInitials.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(doctorId)))
        }

        tvInitials.text =
            "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
                .ifEmpty { "DR" }

        loadBase64Image(profilePic, ivPic, tvInitials)

        card.setOnClickListener { showApptDetail(appt) }

        return card
    }

    private fun showApptDetail(appt: AppointmentResponse) {
        val status = (appt.status ?: "").uppercase()

        val apptDoctor = appt.doctor
        val docId = apptDoctor?.doctorId

        val cachedDoctor = DataCache.doctors.firstOrNull {
            it.doctorId == docId
        }

        val fn = apptDoctor?.firstName ?: cachedDoctor?.firstName ?: ""
        val ln = apptDoctor?.lastName ?: cachedDoctor?.lastName ?: ""
        val spec = apptDoctor?.specialization ?: cachedDoctor?.specialization ?: "General Practitioner"
        val profilePic = apptDoctor?.profilePicture ?: cachedDoctor?.profilePicture

        val dialogView = layoutInflater.inflate(R.layout.dialog_appointment_detail, null)

        dialogView.findViewById<LinearLayout>(R.id.layoutDetailHeader).background =
            headerGradient(status)

        val tvInit = dialogView.findViewById<TextView>(R.id.tvDetailInitials)
        val ivPic = dialogView.findViewById<ImageView>(R.id.ivDetailDoctorPic)

        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(docId)))
        }

        tvInit.text =
            "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
                .ifEmpty { "DR" }

        loadBase64Image(profilePic, ivPic, tvInit)

        dialogView.findViewById<TextView>(R.id.tvDetailDoctorName).text =
            "Dr. $fn $ln".trim().ifEmpty { "Doctor" }

        dialogView.findViewById<TextView>(R.id.tvDetailSpec).text = spec
        dialogView.findViewById<TextView>(R.id.tvDetailStatus).text = status

        dialogView.findViewById<TextView>(R.id.tvDetailDate).text =
            formatDateLong(appt.requestedDate)

        dialogView.findViewById<TextView>(R.id.tvDetailTime).text =
            appt.requestedTime ?: "—"

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

        if (status == "COMPLETED") {
            dialogView.findViewById<LinearLayout>(R.id.layoutDetailNotes).visibility = View.VISIBLE
            val tvNotes = dialogView.findViewById<TextView>(R.id.tvDetailNotes)
            tvNotes.text = if (!appt.doctorNotes.isNullOrEmpty()) {
                appt.doctorNotes
            } else {
                tvNotes.setTextColor(Color.parseColor("#3B82F6"))
                "No notes were added."
            }

            if (!appt.completedAt.isNullOrEmpty()) {
                val tv = dialogView.findViewById<TextView>(R.id.tvDetailCompletedAt)
                tv.text = "Completed on ${formatDateLong(appt.completedAt!!.take(10))}"
                tv.visibility = View.VISIBLE
            }
        }

        if (status == "CANCELLED") {
            val cancelSection = dialogView.findViewById<LinearLayout>(R.id.layoutDetailCancel)
            cancelSection.visibility = View.VISIBLE

            val ci = getCancelledByStyle(appt.cancelledBy)

            cancelSection.background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(14).toFloat()
                setColor(Color.parseColor(ci.bg))
                setStroke(dpToPx(2), Color.parseColor(ci.border))
            }

            dialogView.findViewById<TextView>(R.id.tvCancelTitle)
                .setTextColor(Color.parseColor(ci.color))

            dialogView.findViewById<TextView>(R.id.tvCancelledBy).apply {
                text = ci.label
                setTextColor(Color.parseColor(ci.color))
            }

            dialogView.findViewById<TextView>(R.id.tvDetailCancelReason).apply {
                text = if (!appt.cancelReason.isNullOrEmpty()) {
                    appt.cancelReason
                } else {
                    "No reason was provided."
                }
                setTextColor(Color.parseColor(ci.color))
            }

            if (!appt.cancelledAt.isNullOrEmpty()) {
                val tv = dialogView.findViewById<TextView>(R.id.tvDetailCancelledAt)
                tv.text = "Cancelled on ${formatDateLong(appt.cancelledAt!!.take(10))}"
                tv.setTextColor(Color.parseColor(ci.color))
                tv.visibility = View.VISIBLE
            }
        }

        if (status == "REJECTED") {
            val rejectSection = dialogView.findViewById<LinearLayout>(R.id.layoutDetailReject)
            rejectSection.visibility = View.VISIBLE

            dialogView.findViewById<TextView>(R.id.tvDetailRejectReason).text =
                if (!(appt.rejectedReason ?: appt.rejectReason).isNullOrEmpty()) {
                    appt.rejectedReason ?: appt.rejectReason
                } else {
                    "No reason was provided."
                }

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
            .setPositiveButton("Close") { dialog, _ -> dialog.dismiss() }
            .show()
    }

    private fun loadBase64Image(
        profilePic: String?,
        imageView: ImageView,
        initialsView: TextView
    ) {
        if (!profilePic.isNullOrEmpty()) {
            try {
                val imageData = profilePic.substringAfter(",", profilePic)
                val bytes = Base64.decode(imageData, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)

                if (bitmap != null) {
                    imageView.setImageBitmap(bitmap)
                    imageView.visibility = View.VISIBLE
                    initialsView.visibility = View.GONE
                    return
                }
            } catch (_: Exception) {
            }
        }

        imageView.visibility = View.GONE
        initialsView.visibility = View.VISIBLE
    }

    private fun headerGradient(status: String?): GradientDrawable {
        val (start, end) = when (status?.uppercase()) {
            "CONFIRMED" -> Pair("#059669", "#047857")
            "COMPLETED" -> Pair("#2563eb", "#1d4ed8")
            "CANCELLED" -> Pair("#64748b", "#475569")
            "REJECTED" -> Pair("#ef4444", "#dc2626")
            "PENDING" -> Pair("#f59e0b", "#d97706")
            else -> Pair("#64748b", "#334155")
        }

        return GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(Color.parseColor(start), Color.parseColor(end))
        )
    }

    data class CancelStyle(
        val label: String,
        val color: String,
        val bg: String,
        val border: String
    )

    private fun getCancelledByStyle(cancelledBy: String?): CancelStyle =
        when (cancelledBy?.uppercase()) {
            "PATIENT" -> CancelStyle("Cancelled by you", "#64748b", "#f1f5f9", "#cbd5e1")
            "DOCTOR" -> CancelStyle("Cancelled by doctor", "#dc2626", "#fef2f2", "#fecaca")
            "SECRETARY" -> CancelStyle("Cancelled by clinic", "#d97706", "#fffbeb", "#fde68a")
            else -> CancelStyle("Appointment cancelled", "#64748b", "#f1f5f9", "#cbd5e1")
        }

    private fun applyBadgeStyle(view: TextView, status: String) {
        val style = badgeStyles[status] ?: badgeStyles["PENDING"]!!

        view.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(style.bgColor))
            setStroke(dpToPx(1), Color.parseColor(style.borderColor))
        }

        view.setTextColor(Color.parseColor(style.textColor))
    }

    private fun formatDate(date: String?): String {
        if (date.isNullOrEmpty()) return "—"

        return try {
            val input = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val output = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
            output.format(input.parse(date)!!)
        } catch (_: Exception) {
            date
        }
    }

    private fun formatDateLong(date: String?): String {
        if (date.isNullOrEmpty()) return "—"

        return try {
            val input = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val output = SimpleDateFormat("EEE, MMM d, yyyy", Locale.getDefault())
            output.format(input.parse(date)!!)
        } catch (_: Exception) {
            date
        }
    }

    private fun formatDateTime(dateTime: String?): String {
        if (dateTime.isNullOrEmpty()) return "—"

        return try {
            val clean = dateTime.substring(0, minOf(19, dateTime.length))
            val input = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val output = SimpleDateFormat("MMM d, yyyy h:mm a", Locale.getDefault())
            output.format(input.parse(clean)!!)
        } catch (_: Exception) {
            dateTime
        }
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }
}