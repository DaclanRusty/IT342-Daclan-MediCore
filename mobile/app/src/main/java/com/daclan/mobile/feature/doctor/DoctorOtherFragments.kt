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
import com.daclan.mobile.shared.network.DoctorCache
import java.text.SimpleDateFormat
import java.util.*

class DoctorCalendarFragment : Fragment() {

    private lateinit var tvCalendarDate: TextView
    private lateinit var layoutCalAppts: LinearLayout
    private lateinit var progressCal:    ProgressBar
    private lateinit var tvCalEmpty:     TextView
    private lateinit var btnPrevDay:     ImageView
    private lateinit var btnNextDay:     ImageView
    private lateinit var btnToday:       TextView

    private var currentDate = Date()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctor_calendar, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)
        tvCalendarDate = view.findViewById(R.id.tvCalendarDate)
        layoutCalAppts = view.findViewById(R.id.layoutCalAppts)
        progressCal    = view.findViewById(R.id.progressCal)
        tvCalEmpty     = view.findViewById(R.id.tvCalEmpty)
        btnPrevDay     = view.findViewById(R.id.btnCalPrev)
        btnNextDay     = view.findViewById(R.id.btnCalNext)
        btnToday       = view.findViewById(R.id.btnCalToday)

        btnPrevDay.setOnClickListener { navigateDay(-1) }
        btnNextDay.setOnClickListener { navigateDay(1)  }
        btnToday.setOnClickListener   { currentDate = Date(); loadFromCache() }

        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (DoctorCache.appointmentsLoaded) {
            progressCal.visibility = View.GONE
            renderDayAppts()
        } else {
            progressCal.visibility = View.VISIBLE
        }
    }

    private fun navigateDay(dir: Int) {
        val cal = Calendar.getInstance()
        cal.time = currentDate
        cal.add(Calendar.DAY_OF_MONTH, dir)
        currentDate = cal.time
        loadFromCache()
    }

    private fun renderDayAppts() {
        if (!isAdded) return
        val sdf     = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val dateStr = sdf.format(currentDate)
        val display = SimpleDateFormat("EEE, MMM d, yyyy", Locale.getDefault())
        tvCalendarDate.text = display.format(currentDate)

        val dayAppts = DoctorCache.appointments.filter { it.requestedDate == dateStr }

        layoutCalAppts.removeAllViews()
        if (dayAppts.isEmpty()) {
            tvCalEmpty.visibility = View.VISIBLE; return
        }
        tvCalEmpty.visibility = View.GONE

        val slots = listOf("08:00 AM","09:00 AM","10:00 AM","11:00 AM",
            "01:00 PM","02:00 PM","03:00 PM","04:00 PM")
        slots.forEach { slot ->
            val slotAppts = dayAppts.filter {
                it.requestedTime?.trim()?.uppercase() == slot.uppercase()
            }
            val row = layoutInflater.inflate(R.layout.item_calendar_slot, layoutCalAppts, false)
            row.findViewById<TextView>(R.id.tvSlotTime).text = slot

            val container = row.findViewById<LinearLayout>(R.id.layoutSlotAppts)
            if (slotAppts.isEmpty()) {
                val empty = View(requireContext())
                empty.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(40))
                empty.background = android.graphics.drawable.GradientDrawable().apply {
                    shape        = android.graphics.drawable.GradientDrawable.RECTANGLE
                    cornerRadius = dpToPx(8).toFloat()
                    setColor(Color.parseColor("#FAFAFA"))
                    setStroke(dpToPx(1), Color.parseColor("#E2E8F0"))
                }
                container.addView(empty)
            } else {
                slotAppts.forEach { appt ->
                    val apptView = layoutInflater.inflate(
                        R.layout.item_calendar_appt, container, false)
                    val fn = appt.patient?.firstName ?: ""
                    val ln = appt.patient?.lastName  ?: ""
                    apptView.findViewById<TextView>(R.id.tvCalApptName).text   = "$fn $ln".trim()
                    apptView.findViewById<TextView>(R.id.tvCalApptReason).text = appt.resolvedReason() ?: "—"  // ← fixed
                    val tvStatus = apptView.findViewById<TextView>(R.id.tvCalApptStatus)
                    tvStatus.text = appt.status ?: ""
                    container.addView(apptView)
                }
            }
            layoutCalAppts.addView(row)
        }
    }

    private fun dpToPx(dp: Int) = (dp * resources.displayMetrics.density).toInt()
}

// ══════════════════════════════════════════════════════════════════
// PROFILE FRAGMENT — mirrors ProfileTab.jsx (read-only view)
// ══════════════════════════════════════════════════════════════════
class DoctorProfileFragment : Fragment() {

    private lateinit var tvProfileName:     TextView
    private lateinit var tvProfileEmail:    TextView
    private lateinit var tvProfileSpec:     TextView
    private lateinit var tvProfilePhone:    TextView
    private lateinit var tvProfileYoe:      TextView
    private lateinit var tvProfileBio:      TextView
    private lateinit var tvProfileInitials: TextView
    private lateinit var ivProfilePic:      ImageView
    private lateinit var progressProfile:   ProgressBar

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctor_profile, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)
        tvProfileName     = view.findViewById(R.id.tvDoctorProfileName)
        tvProfileEmail    = view.findViewById(R.id.tvDoctorProfileEmail)
        tvProfileSpec     = view.findViewById(R.id.tvDoctorProfileSpec)
        tvProfilePhone    = view.findViewById(R.id.tvDoctorProfilePhone)
        tvProfileYoe      = view.findViewById(R.id.tvDoctorProfileYoe)
        tvProfileBio      = view.findViewById(R.id.tvDoctorProfileBio)
        tvProfileInitials = view.findViewById(R.id.tvDoctorProfileInitials)
        ivProfilePic      = view.findViewById(R.id.ivDoctorProfilePic)
        progressProfile   = view.findViewById(R.id.progressDoctorProfile)
        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (DoctorCache.profileLoaded && DoctorCache.profile != null) {
            progressProfile.visibility = View.GONE
            val p  = DoctorCache.profile!!
            val fn = p.firstName ?: ""
            val ln = p.lastName  ?: ""
            tvProfileName.text  = "Dr. $fn $ln".trim()
            tvProfileEmail.text = p.email ?: ""
            tvProfileSpec.text  = p.specialization ?: "Not provided"
            tvProfilePhone.text = p.phoneNumber ?: "Not provided"
            tvProfileYoe.text   = if (p.yearsOfExperience != null) "${p.yearsOfExperience} years" else "Not provided"
            tvProfileBio.text   = p.bio ?: "No biography provided."

            tvProfileInitials.text =
                "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

            if (!p.profilePicture.isNullOrEmpty()) {
                try {
                    val bytes  = Base64.decode(p.profilePicture.substringAfter(","), Base64.DEFAULT)
                    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    ivProfilePic.setImageBitmap(bitmap)
                    ivProfilePic.visibility      = View.VISIBLE
                    tvProfileInitials.visibility = View.GONE
                } catch (_: Exception) {}
            }
        } else {
            progressProfile.visibility = View.VISIBLE
        }
    }
}