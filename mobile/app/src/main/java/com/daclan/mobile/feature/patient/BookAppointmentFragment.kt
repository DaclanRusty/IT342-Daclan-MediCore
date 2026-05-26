package com.daclan.mobile.feature.patient

import android.app.DatePickerDialog
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.DataCache
import com.daclan.mobile.shared.network.DoctorSummary
import com.daclan.mobile.shared.network.RetrofitClient
import com.daclan.mobile.shared.network.BookAppointmentRequest
import kotlinx.coroutines.launch
import java.util.Calendar

class BookAppointmentFragment : Fragment() {

    private var currentStep = 1
    private var selectedDoctor: DoctorSummary? = null

    private lateinit var layoutStep1: LinearLayout
    private lateinit var layoutDoctorList: LinearLayout
    private lateinit var btnNext: Button
    private lateinit var btnCancelStep1: Button

    private lateinit var layoutStep2: LinearLayout
    private lateinit var tvDoctorName: TextView
    private lateinit var tvDoctorSpec: TextView
    private lateinit var tvInitials: TextView
    private lateinit var btnChangeDoctor: TextView
    private lateinit var etDate: EditText
    private lateinit var layoutSlots: LinearLayout
    private lateinit var etReason: EditText
    private lateinit var tvReasonCount: TextView
    private lateinit var btnBook: Button
    private lateinit var btnBack: ImageView
    private lateinit var layoutError: LinearLayout
    private lateinit var tvError: TextView
    private lateinit var progressBook: ProgressBar

    private lateinit var stepBar1: View
    private lateinit var stepBar2: View

    private var selectedDate = ""
    private var selectedTime = ""
    private var takenSlots: List<String> = emptyList()

    private val allSlots = listOf(
        "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    )

    private val docColors = arrayOf(
        "#2563eb", "#7c3aed", "#059669", "#f59e0b",
        "#ef4444", "#0891b2", "#db2777", "#16a34a"
    )

    private fun docColor(id: Long?) =
        docColors[((id ?: 0L) % docColors.size).toInt()]

    companion object {
        fun newInstance(doc: DoctorSummary): BookAppointmentFragment {
            val frag = BookAppointmentFragment()
            val args = Bundle()
            args.putLong("doctorId", doc.doctorId ?: 0)
            args.putString("firstName", doc.firstName)
            args.putString("lastName", doc.lastName)
            args.putString("spec", doc.specialization)
            frag.arguments = args
            return frag
        }

        fun newInstance(): BookAppointmentFragment {
            return BookAppointmentFragment()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        saved: Bundle?
    ): View = inflater.inflate(R.layout.fragment_book_appointment, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        stepBar1 = view.findViewById(R.id.stepBar1)
        stepBar2 = view.findViewById(R.id.stepBar2)

        layoutStep1 = view.findViewById(R.id.layoutStep1)
        layoutDoctorList = view.findViewById(R.id.layoutDoctorList)
        btnNext = view.findViewById(R.id.btnNext)
        btnCancelStep1 = view.findViewById(R.id.btnCancelStep1)

        layoutStep2 = view.findViewById(R.id.layoutStep2)
        tvDoctorName = view.findViewById(R.id.tvBookDoctorName)
        tvDoctorSpec = view.findViewById(R.id.tvBookDoctorSpec)
        tvInitials = view.findViewById(R.id.tvBookDoctorInitials)
        btnChangeDoctor = view.findViewById(R.id.btnChangeDoctor)
        etDate = view.findViewById(R.id.etBookDate)
        layoutSlots = view.findViewById(R.id.layoutTimeSlots)
        etReason = view.findViewById(R.id.etBookReason)
        tvReasonCount = view.findViewById(R.id.tvReasonCount)
        btnBook = view.findViewById(R.id.btnConfirmBook)
        btnBack = view.findViewById(R.id.btnBackFromBook)
        layoutError = view.findViewById(R.id.layoutBookError)
        tvError = view.findViewById(R.id.tvBookError)
        progressBook = view.findViewById(R.id.progressBook)

        val preselectedId = arguments?.getLong("doctorId") ?: 0L

        if (preselectedId != 0L) {
            val fn = arguments?.getString("firstName") ?: ""
            val ln = arguments?.getString("lastName") ?: ""
            val spec = arguments?.getString("spec") ?: ""

            selectedDoctor = DoctorSummary(
                doctorId = preselectedId,
                firstName = fn,
                lastName = ln,
                specialization = spec
            )

            goToStep2()
        } else {
            goToStep1()
        }

        setupStep2Listeners()
    }

    private fun goToStep1() {
        currentStep = 1
        layoutStep1.visibility = View.VISIBLE
        layoutStep2.visibility = View.GONE
        updateStepBars()
        renderDoctorList()

        btnNext.setOnClickListener {
            if (selectedDoctor == null) {
                Toast.makeText(requireContext(), "Please select a doctor first.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            goToStep2()
        }

        btnCancelStep1.setOnClickListener {
            parentFragmentManager.popBackStack()
        }
    }

    private fun renderDoctorList() {
        layoutDoctorList.removeAllViews()
        val doctors = DataCache.doctors

        if (doctors.isEmpty()) {
            val tv = TextView(requireContext()).apply {
                text = "No doctors available."
                textSize = 13f
                setTextColor(Color.parseColor("#94A3B8"))
                setPadding(0, 16, 0, 16)
            }
            layoutDoctorList.addView(tv)
            return
        }

        doctors.forEach { doc ->
            layoutDoctorList.addView(buildDoctorItem(doc))
            val divider = View(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 1)
                setBackgroundColor(Color.parseColor("#F1F5F9"))
            }
            layoutDoctorList.addView(divider)
        }
    }

    private fun buildDoctorItem(doc: DoctorSummary): View {
        val fn = doc.firstName ?: ""
        val ln = doc.lastName ?: ""

        val row = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setPadding(dpToPx(12), dpToPx(14), dpToPx(12), dpToPx(14))
            isClickable = true
            isFocusable = true
            background = android.util.TypedValue().let { tv ->
                context.theme.resolveAttribute(android.R.attr.selectableItemBackground, tv, true)
                androidx.core.content.ContextCompat.getDrawable(context, tv.resourceId)
            }
        }

        val tvAvatar = TextView(requireContext()).apply {
            val size = dpToPx(40)
            layoutParams = LinearLayout.LayoutParams(size, size).also { it.marginEnd = dpToPx(12) }
            gravity = android.view.Gravity.CENTER
            textSize = 13f
            setTextColor(Color.WHITE)
            text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor(docColor(doc.doctorId)))
            }
        }

        val colText = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        colText.addView(TextView(requireContext()).apply {
            text = "Dr. $fn $ln".trim()
            textSize = 14f
            setTextColor(Color.parseColor("#0F172A"))
            setTypeface(null, android.graphics.Typeface.BOLD)
        })

        colText.addView(TextView(requireContext()).apply {
            text = doc.specialization ?: "—"
            textSize = 12f
            setTextColor(Color.parseColor("#2563EB"))
        })

        val tvRadio = TextView(requireContext()).apply {
            val size = dpToPx(20)
            layoutParams = LinearLayout.LayoutParams(size, size).also { it.marginStart = dpToPx(8) }
            gravity = android.view.Gravity.CENTER
            textSize = 10f
        }
        updateRadio(tvRadio, doc == selectedDoctor)

        row.addView(tvAvatar)
        row.addView(colText)
        row.addView(tvRadio)

        row.setOnClickListener {
            selectedDoctor = doc
            renderDoctorList()
        }

        return row
    }

    private fun updateRadio(view: TextView, selected: Boolean) {
        view.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            if (selected) {
                setColor(Color.parseColor("#2563EB"))
                setStroke(dpToPx(2), Color.parseColor("#2563EB"))
            } else {
                setColor(Color.WHITE)
                setStroke(dpToPx(2), Color.parseColor("#CBD5E1"))
            }
        }
        view.text = if (selected) "✓" else ""
        view.setTextColor(Color.WHITE)
    }

    private fun goToStep2() {
        currentStep = 2
        layoutStep1.visibility = View.GONE
        layoutStep2.visibility = View.VISIBLE
        updateStepBars()

        val doc = selectedDoctor ?: return
        val fn = doc.firstName ?: ""
        val ln = doc.lastName ?: ""

        tvDoctorName.text = "Dr. $fn $ln".trim()
        tvDoctorSpec.text = doc.specialization ?: "—"
        tvInitials.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
        tvInitials.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(doc.doctorId)))
        }
    }

    private fun setupStep2Listeners() {
        etReason.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {}
            override fun onTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {
                val len = s?.length ?: 0
                tvReasonCount.text = "$len/500"
                tvReasonCount.setTextColor(
                    if (len > 450) Color.parseColor("#F59E0B") else Color.parseColor("#94A3B8")
                )
            }
        })

        etDate.isFocusable = false
        etDate.setOnClickListener {
            val cal = Calendar.getInstance()
            cal.add(Calendar.DAY_OF_MONTH, 1)
            val dpd = DatePickerDialog(requireContext(), { _, y, m, d ->
                selectedDate = "$y-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}"
                etDate.setText(selectedDate)
                selectedTime = ""
                loadTakenSlots(selectedDoctor?.doctorId ?: 0L, selectedDate)
            }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH))
            dpd.datePicker.minDate = cal.timeInMillis
            dpd.show()
        }

        btnChangeDoctor.setOnClickListener { goToStep1() }

        btnBack.setOnClickListener {
            if (currentStep == 2 && (arguments?.getLong("doctorId") ?: 0L) == 0L) {
                goToStep1()
            } else {
                parentFragmentManager.popBackStack()
            }
        }

        btnBook.setOnClickListener { handleBook(selectedDoctor?.doctorId ?: 0L) }
    }

    private fun updateStepBars() {
        stepBar1.setBackgroundColor(Color.parseColor("#2563EB"))
        stepBar2.setBackgroundColor(
            if (currentStep == 2) Color.parseColor("#2563EB") else Color.parseColor("#E2E8F0")
        )
    }

    private fun loadTakenSlots(doctorId: Long, date: String) {
        layoutSlots.removeAllViews()
        layoutSlots.addView(TextView(requireContext()).apply {
            text = "Checking availability…"
            textSize = 13f
            setTextColor(Color.parseColor("#64748B"))
            setPadding(0, 8, 0, 8)
        })

        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token = dashboard.getToken()
                val resp = RetrofitClient.patientApi.getTakenSlots(
                    RetrofitClient.bearerToken(token), doctorId, date)
                takenSlots = if (resp.isSuccessful) resp.body()?.data ?: emptyList() else emptyList()
            } catch (_: Exception) { takenSlots = emptyList() }
            buildTimeSlots()
        }
    }

    private fun buildTimeSlots() {
        layoutSlots.removeAllViews()
        var row: LinearLayout? = null

        allSlots.forEachIndexed { idx, slot ->
            if (idx % 4 == 0) {
                row = LinearLayout(requireContext()).apply {
                    orientation = LinearLayout.HORIZONTAL
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).also { it.bottomMargin = dpToPx(8) }
                }
                layoutSlots.addView(row)
            }

            val taken = takenSlots.any { it.trim().equals(slot.trim(), ignoreCase = true) }
            val selected = slot == selectedTime

            val btn = Button(requireContext()).apply {
                text = slot
                textSize = 12f
                isEnabled = !taken
                alpha = if (taken) 0.45f else 1f
                stateListAnimator = null
                val params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                params.marginEnd = if (idx % 4 < 3) dpToPx(8) else 0
                layoutParams = params
                setBackgroundResource(when {
                    taken    -> R.drawable.slot_taken_bg
                    selected -> R.drawable.slot_selected_bg
                    else     -> R.drawable.slot_available_bg
                })
                setTextColor(when {
                    taken    -> Color.parseColor("#CBD5E1")
                    selected -> Color.WHITE
                    else     -> Color.parseColor("#334155")
                })
            }

            if (!taken) btn.setOnClickListener { selectedTime = slot; buildTimeSlots() }
            row?.addView(btn)
        }
    }

    private fun handleBook(doctorId: Long) {
        val reason = etReason.text.toString().trim()

        when {
            doctorId == 0L         -> { showError("Please select a doctor.");                      return }
            selectedDate.isEmpty() -> { showError("Please select a date.");                        return }
            selectedTime.isEmpty() -> { showError("Please select a time slot.");                   return }
            reason.isEmpty()       -> { showError("Please enter a reason for the appointment.");   return }
        }

        hideError()
        progressBook.visibility = View.VISIBLE
        btnBook.isEnabled = false

        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token = dashboard.getToken()

                val resp = RetrofitClient.patientApi.bookAppointment(
                    RetrofitClient.bearerToken(token),
                    BookAppointmentRequest(
                        doctorId       = doctorId,
                        requestedDate  = selectedDate,
                        requestedTime  = selectedTime,
                        reasonForVisit = reason
                    )
                )

                progressBook.visibility = View.GONE
                btnBook.isEnabled = true

                if (resp.isSuccessful && resp.body()?.success == true) {
                    Toast.makeText(
                        requireContext(),
                        "Appointment submitted! Waiting for confirmation.",
                        Toast.LENGTH_LONG
                    ).show()
                    parentFragmentManager.popBackStack()
                    (activity as? PatientDashboardActivity)?.switchTab("appointments")
                } else {
                    val errorBody = resp.errorBody()?.string()
                    android.util.Log.e("BOOK_APPOINTMENT", "Code: ${resp.code()}, Error: $errorBody")
                    showError(errorBody ?: resp.body()?.errorMessage() ?: "Booking failed. Please try again.")
                }
            } catch (e: Exception) {
                progressBook.visibility = View.GONE
                btnBook.isEnabled = true
                showError("Connection error. Is your backend running?")
            }
        }
    }

    private fun showError(msg: String) {
        tvError.text = msg
        layoutError.visibility = View.VISIBLE
    }

    private fun hideError() {
        layoutError.visibility = View.GONE
    }

    private fun dpToPx(dp: Int): Int = (dp * resources.displayMetrics.density).toInt()
}