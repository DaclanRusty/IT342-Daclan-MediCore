package com.daclan.mobile.feature.doctor

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
import com.daclan.mobile.shared.network.CancelAppointmentRequest
import com.daclan.mobile.shared.network.CompleteAppointmentRequest
import com.daclan.mobile.shared.network.DoctorAppointmentResponse
import com.daclan.mobile.shared.network.DoctorCache
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class DoctorAppointmentsFragment : Fragment() {

    private lateinit var filterGroup:   LinearLayout
    private lateinit var layoutAppts:   LinearLayout
    private lateinit var progressAppts: ProgressBar
    private lateinit var layoutEmpty:   LinearLayout
    private lateinit var tvEmptyText:   TextView

    private var currentFilter = "ALL"
    private val filters = listOf("ALL", "CONFIRMED", "COMPLETED", "CANCELLED")

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctor_appointments, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)
        filterGroup   = view.findViewById(R.id.doctorFilterGroup)
        layoutAppts   = view.findViewById(R.id.layoutDoctorAppts)
        progressAppts = view.findViewById(R.id.progressDoctorAppts)
        layoutEmpty   = view.findViewById(R.id.layoutDoctorApptEmpty)
        tvEmptyText   = view.findViewById(R.id.tvDoctorApptEmptyText)

        buildFilterPills()
        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (DoctorCache.appointmentsLoaded) {
            progressAppts.visibility = View.GONE
            renderList()
        } else {
            progressAppts.visibility = View.VISIBLE
        }
    }

    private fun buildFilterPills() {
        filterGroup.removeAllViews()
        filters.forEach { f ->
            val tv = TextView(requireContext())
            tv.text     = f
            tv.textSize = 12f
            tv.setPadding(dpToPx(14), dpToPx(6), dpToPx(14), dpToPx(6))
            val isActive = f == currentFilter
            tv.background = GradientDrawable().apply {
                shape        = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(100).toFloat()
                setColor(Color.parseColor(if (isActive) "#f0fdf4" else "#F8FAFC"))
                setStroke(dpToPx(2), Color.parseColor(if (isActive) "#059669" else "#E2E8F0"))
            }
            tv.setTextColor(Color.parseColor(if (isActive) "#059669" else "#64748b"))
            tv.typeface = android.graphics.Typeface.DEFAULT_BOLD
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            params.marginEnd = dpToPx(6)
            tv.layoutParams = params
            tv.setOnClickListener { currentFilter = f; buildFilterPills(); renderList() }
            filterGroup.addView(tv)
        }
    }

    private fun renderList() {
        if (!isAdded) return
        layoutAppts.removeAllViews()
        val all  = DoctorCache.appointments
        val list = if (currentFilter == "ALL") all
        else all.filter { (it.status ?: "").uppercase() == currentFilter }

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

    private fun buildApptCard(appt: DoctorAppointmentResponse): View {
        val card   = layoutInflater.inflate(R.layout.item_doctor_appointment_card, layoutAppts, false)
        val fn     = appt.patient?.firstName ?: ""
        val ln     = appt.patient?.lastName  ?: ""
        val status = (appt.status ?: "").uppercase()

        card.findViewById<TextView>(R.id.tvDoctorApptPatientName).text = "$fn $ln".trim()
        card.findViewById<TextView>(R.id.tvDoctorApptDate).text        = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvDoctorApptTime).text        = appt.requestedTime ?: "—"
        card.findViewById<TextView>(R.id.tvDoctorApptReason).text      = appt.resolvedReason() ?: "—"

        // Booked at
        val tvBooked = card.findViewById<TextView>(R.id.tvDoctorApptBookedAt)
        if (!appt.createdAt.isNullOrEmpty()) {
            tvBooked.text = "🕐 Booked ${formatDate(appt.createdAt?.take(10))}"
            tvBooked.visibility = View.VISIBLE
        }

        // Status badge
        val tvStatus = card.findViewById<TextView>(R.id.tvDoctorApptStatus)
        tvStatus.text = status
        applyBadge(tvStatus, status)

        // Doctor notes (completed)
        val tvNotes = card.findViewById<TextView>(R.id.tvDoctorApptNotes)
        if (status == "COMPLETED" && !appt.doctorNotes.isNullOrEmpty()) {
            tvNotes.text = "📝 ${appt.doctorNotes}"
            tvNotes.visibility = View.VISIBLE
        }

        // Cancel reason
        val tvCancel = card.findViewById<TextView>(R.id.tvDoctorApptCancelReason)
        if (status == "CANCELLED" && !appt.cancelReason.isNullOrEmpty()) {
            tvCancel.text = "✕ ${appt.cancelReason}"
            tvCancel.visibility = View.VISIBLE
        }

        // Avatar
        val tvInit = card.findViewById<TextView>(R.id.tvDoctorApptInitials)
        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#059669"))
        }
        tvInit.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val ivPic = card.findViewById<ImageView>(R.id.ivDoctorApptPic)
        if (!appt.patient?.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(appt.patient!!.profilePicture!!.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility  = View.VISIBLE
                tvInit.visibility = View.GONE
            } catch (_: Exception) {}
        }

        // Complete + Cancel buttons (only for CONFIRMED)
        val btnComplete = card.findViewById<Button>(R.id.btnCompleteAppt)
        val btnCancel   = card.findViewById<Button>(R.id.btnCancelAppt)
        val btnLayout   = card.findViewById<LinearLayout>(R.id.layoutApptActions)

        if (status == "CONFIRMED") {
            btnLayout.visibility = View.VISIBLE
            btnComplete.setOnClickListener { showCompleteDialog(appt) }
            btnCancel.setOnClickListener   { showCancelDialog(appt)   }
        } else {
            btnLayout.visibility = View.GONE
        }

        return card
    }

    // ── Complete Dialog ────────────────────────────────────────────────────
    private fun showCompleteDialog(appt: DoctorAppointmentResponse) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_doctor_complete, null)
        val fn = appt.patient?.firstName ?: ""
        val ln = appt.patient?.lastName  ?: ""
        dialogView.findViewById<TextView>(R.id.tvCompletePatientName).text = "$fn $ln".trim()
        val etNotes = dialogView.findViewById<EditText>(R.id.etDoctorNotes)

        AlertDialog.Builder(requireContext(), R.style.MedicoreDialog)
            .setView(dialogView)
            .setPositiveButton("Confirm Completed") { d, _ ->
                d.dismiss()
                performComplete(appt.id ?: return@setPositiveButton, etNotes.text.toString().trim())
            }
            .setNegativeButton("Cancel") { d, _ -> d.dismiss() }
            .show()
    }

    // ── Cancel Dialog ──────────────────────────────────────────────────────
    private fun showCancelDialog(appt: DoctorAppointmentResponse) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_doctor_cancel, null)
        val fn = appt.patient?.firstName ?: ""
        val ln = appt.patient?.lastName  ?: ""
        dialogView.findViewById<TextView>(R.id.tvCancelPatientName).text = "$fn $ln".trim()
        val spinnerReason = dialogView.findViewById<Spinner>(R.id.spinnerCancelReason)
        val reasons = listOf("Select a reason…","Doctor unavailable","Patient no-show","Rescheduled","Other")
        spinnerReason.adapter = ArrayAdapter(requireContext(),
            android.R.layout.simple_spinner_dropdown_item, reasons)

        AlertDialog.Builder(requireContext(), R.style.MedicoreDialog)
            .setView(dialogView)
            .setPositiveButton("Confirm Cancel") { d, _ ->
                d.dismiss()
                val reason = spinnerReason.selectedItem.toString()
                    .takeIf { it != "Select a reason…" }
                performCancel(appt.id ?: return@setPositiveButton, reason)
            }
            .setNegativeButton("Back") { d, _ -> d.dismiss() }
            .show()
    }

    private fun performComplete(id: Long, notes: String?) {
        lifecycleScope.launch {
            try {
                val dashboard = activity as? DoctorDashboardActivity ?: return@launch
                val resp = RetrofitClient.doctorApi.completeAppointment(
                    RetrofitClient.bearerToken(dashboard.getToken()),
                    id,
                    CompleteAppointmentRequest(notes?.ifEmpty { null })
                )
                if (resp.isSuccessful) {
                    Toast.makeText(requireContext(), "Appointment completed!", Toast.LENGTH_SHORT).show()
                    dashboard.refreshData()
                }
            } catch (_: Exception) {
                Toast.makeText(requireContext(), "Failed to complete appointment.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performCancel(id: Long, reason: String?) {
        lifecycleScope.launch {
            try {
                val dashboard = activity as? DoctorDashboardActivity ?: return@launch
                val resp = RetrofitClient.doctorApi.cancelAppointment(
                    RetrofitClient.bearerToken(dashboard.getToken()),
                    id,
                    CancelAppointmentRequest(reason)
                )
                if (resp.isSuccessful) {
                    Toast.makeText(requireContext(), "Appointment cancelled.", Toast.LENGTH_SHORT).show()
                    dashboard.refreshData()
                }
            } catch (_: Exception) {
                Toast.makeText(requireContext(), "Failed to cancel appointment.", Toast.LENGTH_SHORT).show()
            }
        }
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