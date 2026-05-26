package com.daclan.mobile.feature.secretary

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
import com.daclan.mobile.shared.network.SecretaryDataCache
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class SecretaryAppointmentsFragment : Fragment() {

    private lateinit var filterGroup: LinearLayout
    private lateinit var layoutAppts: LinearLayout
    private lateinit var progressAppts: ProgressBar
    private lateinit var layoutEmpty: LinearLayout
    private lateinit var tvEmptyText: TextView

    private var currentFilter = "ALL"
    private val filters = listOf("ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "EXPIRED")

    private val badgeStyles = mapOf(
        "PENDING" to Triple("#fef9c3", "#854d0e", "#fde047"),
        "CONFIRMED" to Triple("#f0fdf4", "#059669", "#bbf7d0"),
        "COMPLETED" to Triple("#eff6ff", "#2563eb", "#bfdbfe"),
        "REJECTED" to Triple("#fef2f2", "#991b1b", "#fecaca"),
        "CANCELLED" to Triple("#f1f5f9", "#64748b", "#cbd5e1"),
        "EXPIRED" to Triple("#fef9c3", "#854d0e", "#fde047")
    )

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_secretary_appointment, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        filterGroup = view.findViewById(R.id.secFilterGroup)
        layoutAppts = view.findViewById(R.id.layoutSecAppts)
        progressAppts = view.findViewById(R.id.progressSecAppts)
        layoutEmpty = view.findViewById(R.id.layoutSecApptEmpty)
        tvEmptyText = view.findViewById(R.id.tvSecApptEmptyText)

        buildFilterPills()
        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (!::progressAppts.isInitialized) return

        if (SecretaryDataCache.appointmentsLoaded) {
            progressAppts.visibility = View.GONE
            layoutEmpty.visibility = View.GONE
            renderList()
        } else {
            progressAppts.visibility = View.VISIBLE
            layoutEmpty.visibility = View.GONE
            layoutAppts.visibility = View.GONE
        }
    }

    fun openAppointment(appt: AppointmentResponse) {
        showDetailDialog(appt)
    }

    private fun buildFilterPills() {
        filterGroup.removeAllViews()

        filters.forEach { f ->
            val tv = TextView(requireContext()).apply {
                text = f
                textSize = 11.5f
                setPadding(dpToPx(14), dpToPx(6), dpToPx(14), dpToPx(6))

                val isActive = f == currentFilter

                background = GradientDrawable().apply {
                    shape = GradientDrawable.RECTANGLE
                    cornerRadius = dpToPx(100).toFloat()
                    setColor(Color.parseColor(if (isActive) "#f5f3ff" else "#F8FAFC"))
                    setStroke(dpToPx(2), Color.parseColor(if (isActive) "#7c3aed" else "#E2E8F0"))
                }

                setTextColor(Color.parseColor(if (isActive) "#7c3aed" else "#64748b"))
                typeface = android.graphics.Typeface.DEFAULT_BOLD

                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                params.marginEnd = dpToPx(6)
                layoutParams = params

                setOnClickListener {
                    currentFilter = f
                    buildFilterPills()
                    renderList()
                }
            }

            filterGroup.addView(tv)
        }
    }

    private fun renderList() {
        if (!isAdded) return

        layoutAppts.removeAllViews()

        val all = SecretaryDataCache.appointments
        val list = if (currentFilter == "ALL") {
            all
        } else {
            all.filter { it.status?.uppercase() == currentFilter }
        }

        if (list.isEmpty()) {
            tvEmptyText.text = if (currentFilter == "ALL") {
                "No appointments found."
            } else {
                "No ${currentFilter.lowercase()} appointments."
            }

            layoutAppts.visibility = View.GONE
            layoutEmpty.visibility = View.VISIBLE
            return
        }

        layoutEmpty.visibility = View.GONE
        layoutAppts.visibility = View.VISIBLE

        list.forEachIndexed { idx, appt ->
            layoutAppts.addView(buildApptCard(appt))

            if (idx < list.size - 1) {
                layoutAppts.addView(View(requireContext()).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        dpToPx(10)
                    )
                })
            }
        }
    }

    private fun buildApptCard(appt: AppointmentResponse): View {
        val card = layoutInflater.inflate(R.layout.item_secretary_appt_card, layoutAppts, false)
        val status = appt.status?.uppercase() ?: "PENDING"

        val patFn = appt.patient?.firstName ?: ""
        val patLn = appt.patient?.lastName ?: ""
        val docFn = appt.doctor?.firstName ?: ""
        val docLn = appt.doctor?.lastName ?: ""

        card.findViewById<TextView>(R.id.tvSecApptPatientName).text =
            "$patFn $patLn".trim().ifEmpty { "Patient" }

        card.findViewById<TextView>(R.id.tvSecApptDoctorName).text =
            "Dr. $docFn $docLn".trim().ifEmpty { "Doctor" }

        card.findViewById<TextView>(R.id.tvSecApptDate).text = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvSecApptTime).text = appt.requestedTime ?: "—"

        val initials = card.findViewById<TextView>(R.id.tvSecApptInitials)
        val ivPatientPic = card.findViewById<ImageView>(R.id.ivSecApptPatientPic)

        initials.text =
            "${patFn.firstOrNull()?.uppercaseChar() ?: ""}${patLn.firstOrNull()?.uppercaseChar() ?: ""}"
                .ifEmpty { "P" }

        initials.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#7C3AED"))
        }

        loadBase64Image(appt.patient?.profilePicture, ivPatientPic, initials)

        card.findViewById<View>(R.id.viewSecApptAccent).setBackgroundColor(
            Color.parseColor(
                when (status) {
                    "CONFIRMED" -> "#059669"
                    "COMPLETED" -> "#2563eb"
                    "REJECTED", "CANCELLED" -> "#ef4444"
                    "EXPIRED" -> "#f59e0b"
                    else -> "#7c3aed"
                }
            )
        )

        val tvStatus = card.findViewById<TextView>(R.id.tvSecApptStatus)
        tvStatus.text = status

        val (bg, textColor, border) = badgeStyles[status] ?: badgeStyles["PENDING"]!!
        tvStatus.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(bg))
            setStroke(dpToPx(1), Color.parseColor(border))
        }
        tvStatus.setTextColor(Color.parseColor(textColor))

        card.setOnClickListener { showDetailDialog(appt) }

        return card
    }

    private fun showDetailDialog(appt: AppointmentResponse) {
        val status = appt.status?.uppercase() ?: "PENDING"
        val dialogView = layoutInflater.inflate(R.layout.dialog_secretary_appt_detail, null)

        val patFn = appt.patient?.firstName ?: ""
        val patLn = appt.patient?.lastName ?: ""
        val docFn = appt.doctor?.firstName ?: ""
        val docLn = appt.doctor?.lastName ?: ""

        dialogView.findViewById<TextView>(R.id.tvSecDetailPatient).text =
            "$patFn $patLn".trim().ifEmpty { "Patient" }

        dialogView.findViewById<TextView>(R.id.tvSecDetailDoctor).text =
            "Dr. $docFn $docLn".trim().ifEmpty { "Doctor" }

        dialogView.findViewById<TextView>(R.id.tvSecDetailSpec).text =
            appt.doctor?.specialization ?: ""

        dialogView.findViewById<TextView>(R.id.tvSecDetailDate).text =
            formatDateLong(appt.requestedDate)

        dialogView.findViewById<TextView>(R.id.tvSecDetailTime).text =
            appt.requestedTime ?: "—"

        val reason = appt.reason ?: appt.reasonForVisit
        val layoutReason = dialogView.findViewById<LinearLayout>(R.id.layoutSecDetailReason)

        if (!reason.isNullOrEmpty()) {
            dialogView.findViewById<TextView>(R.id.tvSecDetailReason).text = reason
            layoutReason.visibility = View.VISIBLE
        }

        val tvStatus = dialogView.findViewById<TextView>(R.id.tvSecDetailStatus)
        tvStatus.text = status

        val (bg, textColor, border) = badgeStyles[status] ?: badgeStyles["PENDING"]!!
        tvStatus.background = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(bg))
            setStroke(dpToPx(1), Color.parseColor(border))
        }
        tvStatus.setTextColor(Color.parseColor(textColor))

        val layoutActions = dialogView.findViewById<LinearLayout>(R.id.layoutSecDetailActions)
        val layoutReject = dialogView.findViewById<LinearLayout>(R.id.layoutSecRejectInput)
        val layoutCancel = dialogView.findViewById<LinearLayout>(R.id.layoutSecCancelInput)
        val etRejectReason = dialogView.findViewById<EditText>(R.id.etSecRejectReason)
        val etCancelReason = dialogView.findViewById<EditText>(R.id.etSecCancelReason)
        val btnConfirm = dialogView.findViewById<Button>(R.id.btnSecDetailConfirm)
        val btnReject = dialogView.findViewById<Button>(R.id.btnSecDetailReject)
        val btnCancel = dialogView.findViewById<Button>(R.id.btnSecDetailCancel)
        val btnRejectConfirm = dialogView.findViewById<Button>(R.id.btnSecRejectConfirm)
        val btnRejectBack = dialogView.findViewById<Button>(R.id.btnSecRejectBack)
        val btnCancelConfirm = dialogView.findViewById<Button>(R.id.btnSecCancelConfirm)
        val btnCancelBack = dialogView.findViewById<Button>(R.id.btnSecCancelBack)
        val progressAction = dialogView.findViewById<ProgressBar>(R.id.progressSecDetailAction)

        when (status) {
            "PENDING" -> {
                layoutActions.visibility = View.VISIBLE
                btnConfirm.visibility = View.VISIBLE
                btnReject.visibility = View.VISIBLE
                btnCancel.visibility = View.GONE
            }
            "CONFIRMED" -> {
                layoutActions.visibility = View.VISIBLE
                btnConfirm.visibility = View.GONE
                btnReject.visibility = View.GONE
                btnCancel.visibility = View.VISIBLE
            }
            else -> layoutActions.visibility = View.GONE
        }

        val dialog = AlertDialog.Builder(requireContext(), R.style.MedicoreDialog)
            .setView(dialogView)
            .setPositiveButton("Close") { d, _ -> d.dismiss() }
            .create()

        fun setLoading(loading: Boolean) {
            progressAction.visibility = if (loading) View.VISIBLE else View.GONE
            btnConfirm.isEnabled = !loading
            btnReject.isEnabled = !loading
            btnCancel.isEnabled = !loading
            btnRejectConfirm.isEnabled = !loading
            btnCancelConfirm.isEnabled = !loading
        }

        btnConfirm.setOnClickListener {
            val id = appt.id ?: return@setOnClickListener
            setLoading(true)

            lifecycleScope.launch {
                try {
                    val token = (activity as? SecretaryDashboardActivity)?.getToken() ?: ""
                    RetrofitClient.secretaryApi.confirmAppointment(
                        RetrofitClient.bearerToken(token),
                        id
                    )
                    dialog.dismiss()
                    (activity as? SecretaryDashboardActivity)?.refreshAppointments()
                    showToast("Appointment confirmed!")
                } catch (_: Exception) {
                    showToast("Failed to confirm. Try again.")
                } finally {
                    setLoading(false)
                }
            }
        }

        btnReject.setOnClickListener {
            layoutActions.visibility = View.GONE
            layoutReject.visibility = View.VISIBLE
        }

        btnRejectBack.setOnClickListener {
            layoutReject.visibility = View.GONE
            layoutActions.visibility = View.VISIBLE
        }

        btnRejectConfirm.setOnClickListener {
            val id = appt.id ?: return@setOnClickListener
            val reasonText = etRejectReason.text.toString().trim().ifEmpty { null }

            setLoading(true)

            lifecycleScope.launch {
                try {
                    val token = (activity as? SecretaryDashboardActivity)?.getToken() ?: ""
                    RetrofitClient.secretaryApi.rejectAppointment(
                        RetrofitClient.bearerToken(token),
                        id,
                        mapOf("rejectedReason" to reasonText)
                    )
                    dialog.dismiss()
                    (activity as? SecretaryDashboardActivity)?.refreshAppointments()
                    showToast("Appointment rejected.")
                } catch (_: Exception) {
                    showToast("Failed to reject. Try again.")
                } finally {
                    setLoading(false)
                }
            }
        }

        btnCancel.setOnClickListener {
            layoutActions.visibility = View.GONE
            layoutCancel.visibility = View.VISIBLE
        }

        btnCancelBack.setOnClickListener {
            layoutCancel.visibility = View.GONE
            layoutActions.visibility = View.VISIBLE
        }

        btnCancelConfirm.setOnClickListener {
            val id = appt.id ?: return@setOnClickListener
            val reasonText = etCancelReason.text.toString().trim().ifEmpty { null }

            setLoading(true)

            lifecycleScope.launch {
                try {
                    val token = (activity as? SecretaryDashboardActivity)?.getToken() ?: ""
                    RetrofitClient.secretaryApi.cancelAppointment(
                        RetrofitClient.bearerToken(token),
                        id,
                        mapOf("cancelReason" to reasonText)
                    )
                    dialog.dismiss()
                    (activity as? SecretaryDashboardActivity)?.refreshAppointments()
                    showToast("Appointment cancelled.")
                } catch (_: Exception) {
                    showToast("Failed to cancel. Try again.")
                } finally {
                    setLoading(false)
                }
            }
        }

        dialog.show()
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

    private fun showToast(msg: String) {
        if (isAdded) Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
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

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }
}