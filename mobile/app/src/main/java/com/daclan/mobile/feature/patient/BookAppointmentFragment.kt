package com.daclan.mobile.feature.patient

import android.app.DatePickerDialog
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.BookAppointmentRequest
import com.daclan.mobile.shared.network.DoctorSummary
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.launch
import java.util.Calendar

class BookAppointmentFragment : Fragment() {

    private var doctor: DoctorSummary? = null

    private lateinit var tvDoctorName:  TextView
    private lateinit var tvDoctorSpec:  TextView
    private lateinit var tvInitials:    TextView
    private lateinit var etDate:        EditText
    private lateinit var layoutSlots:   LinearLayout
    private lateinit var etReason:      EditText
    private lateinit var tvReasonCount: TextView
    private lateinit var btnBook:       Button
    private lateinit var btnBack:       ImageView
    private lateinit var layoutError:   LinearLayout
    private lateinit var tvError:       TextView
    private lateinit var progressBook:  ProgressBar

    private var selectedDate = ""
    private var selectedTime = ""
    private var takenSlots: List<String> = emptyList()

    private val allSlots = listOf(
        "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
        "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"
    )

    companion object {
        fun newInstance(doc: DoctorSummary): BookAppointmentFragment {
            val frag = BookAppointmentFragment()
            val args = Bundle()
            args.putLong("doctorId",    doc.doctorId ?: 0)
            args.putString("firstName", doc.firstName)
            args.putString("lastName",  doc.lastName)
            args.putString("spec",      doc.specialization)
            args.putString("pic",       doc.profilePicture)
            frag.arguments = args
            return frag
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_book_appointment, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        tvDoctorName  = view.findViewById(R.id.tvBookDoctorName)
        tvDoctorSpec  = view.findViewById(R.id.tvBookDoctorSpec)
        tvInitials    = view.findViewById(R.id.tvBookDoctorInitials)
        etDate        = view.findViewById(R.id.etBookDate)
        layoutSlots   = view.findViewById(R.id.layoutTimeSlots)
        etReason      = view.findViewById(R.id.etBookReason)
        tvReasonCount = view.findViewById(R.id.tvReasonCount)
        btnBook       = view.findViewById(R.id.btnConfirmBook)
        btnBack       = view.findViewById(R.id.btnBackFromBook)
        layoutError   = view.findViewById(R.id.layoutBookError)
        tvError       = view.findViewById(R.id.tvBookError)
        progressBook  = view.findViewById(R.id.progressBook)

        val docId = arguments?.getLong("doctorId") ?: 0
        val fn    = arguments?.getString("firstName") ?: ""
        val ln    = arguments?.getString("lastName")  ?: ""
        val spec  = arguments?.getString("spec")      ?: ""

        tvDoctorName.text = "Dr. $fn $ln".trim()
        tvDoctorSpec.text = spec
        tvInitials.text   = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        // Character counter for reason field
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

        // Date picker — min date is tomorrow
        etDate.isFocusable = false
        etDate.setOnClickListener {
            val cal = Calendar.getInstance()
            cal.add(Calendar.DAY_OF_MONTH, 1)
            val dpd = DatePickerDialog(requireContext(), { _, y, m, d ->
                selectedDate = "$y-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}"
                etDate.setText(selectedDate)
                selectedTime = "" // reset time when date changes
                loadTakenSlots(docId, selectedDate)
            }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH))
            dpd.datePicker.minDate = cal.timeInMillis
            dpd.show()
        }

        btnBack.setOnClickListener { parentFragmentManager.popBackStack() }
        btnBook.setOnClickListener { handleBook(docId) }
    }

    private fun loadTakenSlots(doctorId: Long, date: String) {
        layoutSlots.removeAllViews()
        val loadingTv = TextView(requireContext()).apply {
            text = "Checking availability…"
            textSize = 13f
            setTextColor(Color.parseColor("#64748B"))
            setPadding(0, 8, 0, 8)
        }
        layoutSlots.addView(loadingTv)

        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token     = dashboard.getToken()
                val resp      = RetrofitClient.patientApi.getTakenSlots(
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
                    orientation  = LinearLayout.HORIZONTAL
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).also { it.bottomMargin = dpToPx(8) }
                }
                layoutSlots.addView(row)
            }

            val taken    = takenSlots.any { it.trim().equals(slot.trim(), ignoreCase = true) }
            val selected = slot == selectedTime

            val btn = Button(requireContext()).apply {
                text      = slot
                textSize  = 12f
                isEnabled = !taken
                alpha     = if (taken) 0.45f else 1f
                stateListAnimator = null

                val params = LinearLayout.LayoutParams(0,
                    LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
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

            if (!taken) {
                btn.setOnClickListener {
                    selectedTime = slot
                    buildTimeSlots()
                }
            }
            row?.addView(btn)
        }
    }

    private fun handleBook(doctorId: Long) {
        val reason = etReason.text.toString().trim()
        when {
            selectedDate.isEmpty() -> { showError("Please select a date.");             return }
            selectedTime.isEmpty() -> { showError("Please select a time slot.");        return }
            reason.isEmpty()       -> { showError("Please enter a reason for the appointment."); return }
        }
        hideError()
        progressBook.visibility = View.VISIBLE
        btnBook.isEnabled = false

        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token     = dashboard.getToken()
                val resp      = RetrofitClient.patientApi.bookAppointment(
                    RetrofitClient.bearerToken(token),
                    BookAppointmentRequest(
                        doctorId      = doctorId,
                        requestedDate = selectedDate,
                        requestedTime = selectedTime,
                        reason        = reason
                    )
                )
                progressBook.visibility = View.GONE
                btnBook.isEnabled = true
                if (resp.isSuccessful && resp.body()?.success == true) {
                    Toast.makeText(requireContext(),
                        "Appointment submitted! Waiting for confirmation.",
                        Toast.LENGTH_LONG).show()
                    parentFragmentManager.popBackStack()
                    (activity as? PatientDashboardActivity)?.switchTab("appointments")
                } else {
                    showError(resp.body()?.errorMessage() ?: "Booking failed. Please try again.")
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

    private fun dpToPx(dp: Int): Int =
        (dp * resources.displayMetrics.density).toInt()
}