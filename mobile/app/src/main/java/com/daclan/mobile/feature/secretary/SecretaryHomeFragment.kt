package com.daclan.mobile.feature.secretary

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
import com.daclan.mobile.shared.network.SecretaryDataCache
import java.text.SimpleDateFormat
import java.util.*

class SecretaryHomeFragment : Fragment() {

    private lateinit var tvWelcome:       TextView
    private lateinit var tvStatPending:   TextView
    private lateinit var tvStatConfirmed: TextView
    private lateinit var tvStatCompleted: TextView
    private lateinit var tvStatCancelled: TextView
    private lateinit var layoutDoctorCard: LinearLayout
    private lateinit var tvDoctorName:    TextView
    private lateinit var tvDoctorSpec:    TextView
    private lateinit var tvDoctorInitials: TextView
    private lateinit var ivDoctorPic:     ImageView
    private lateinit var layoutNoPending: LinearLayout
    private lateinit var layoutPendingList: LinearLayout
    private lateinit var progressHome:    ProgressBar
    private lateinit var btnViewAll:      TextView

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_secretary_home, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        tvWelcome        = view.findViewById(R.id.tvSecWelcome)
        tvStatPending    = view.findViewById(R.id.tvSecStatPending)
        tvStatConfirmed  = view.findViewById(R.id.tvSecStatConfirmed)
        tvStatCompleted  = view.findViewById(R.id.tvSecStatCompleted)
        tvStatCancelled  = view.findViewById(R.id.tvSecStatCancelled)
        layoutDoctorCard = view.findViewById(R.id.layoutSecDoctorCard)
        tvDoctorName     = view.findViewById(R.id.tvSecDoctorName)
        tvDoctorSpec     = view.findViewById(R.id.tvSecDoctorSpec)
        tvDoctorInitials = view.findViewById(R.id.tvSecDoctorInitials)
        ivDoctorPic      = view.findViewById(R.id.ivSecDoctorPic)
        layoutNoPending  = view.findViewById(R.id.layoutSecNoPending)
        layoutPendingList = view.findViewById(R.id.layoutSecPendingList)
        progressHome     = view.findViewById(R.id.progressSecHome)
        btnViewAll       = view.findViewById(R.id.btnSecViewAll)

        val dashboard = activity as? SecretaryDashboardActivity
        tvWelcome.text = "Welcome, ${dashboard?.getFirstName() ?: "there"}!"

        btnViewAll.setOnClickListener { dashboard?.switchTab("appointments") }

        loadFromCache()
    }

    override fun onResume() {
        super.onResume()
        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (!::progressHome.isInitialized) return

        if (SecretaryDataCache.appointmentsLoaded) {
            progressHome.visibility = View.GONE
            updateStats(SecretaryDataCache.appointments)
            renderPendingList(SecretaryDataCache.appointments)
        } else {
            progressHome.visibility = View.VISIBLE
            layoutNoPending.visibility  = View.GONE
            layoutPendingList.visibility = View.GONE
        }

        if (SecretaryDataCache.profileLoaded) {
            val fn = SecretaryDataCache.profile?.firstName
                ?: (activity as? SecretaryDashboardActivity)?.getFirstName()
                ?: "there"
            tvWelcome.text = "Welcome, $fn!"
            renderDoctorCard()
        }
    }

    private fun updateStats(all: List<AppointmentResponse>) {
        tvStatPending.text   = all.count { it.status?.uppercase() == "PENDING"   }.toString()
        tvStatConfirmed.text = all.count { it.status?.uppercase() == "CONFIRMED" }.toString()
        tvStatCompleted.text = all.count { it.status?.uppercase() == "COMPLETED" }.toString()
        tvStatCancelled.text = all.count { it.status?.uppercase() == "CANCELLED" }.toString()
    }

    private fun renderDoctorCard() {
        val doc = SecretaryDataCache.profile?.assignedDoctor ?: return
        layoutDoctorCard.visibility = View.VISIBLE

        val fn = doc.firstName ?: ""
        val ln = doc.lastName  ?: ""
        tvDoctorName.text = "Dr. $fn $ln".trim()
        tvDoctorSpec.text = doc.specialization ?: "General Practitioner"

        tvDoctorInitials.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val pic = doc.profilePicture

        android.util.Log.d(
            "SEC_DOCTOR_PIC",
            "doctor=${doc.firstName} ${doc.lastName}, pic=${pic?.take(50)}"
        )
        if (!pic.isNullOrEmpty()) {
            try {
                val bytes  = Base64.decode(pic.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivDoctorPic.setImageBitmap(bitmap)
                ivDoctorPic.visibility      = View.VISIBLE
                tvDoctorInitials.visibility = View.GONE
            } catch (_: Exception) {}
        }
    }

    private fun renderPendingList(all: List<AppointmentResponse>) {
        val pending = all.filter { it.status?.uppercase() == "PENDING" }.take(4)
        layoutPendingList.removeAllViews()

        if (pending.isEmpty()) {
            layoutNoPending.visibility   = View.VISIBLE
            layoutPendingList.visibility = View.GONE
            return
        }

        layoutNoPending.visibility   = View.GONE
        layoutPendingList.visibility = View.VISIBLE

        pending.forEach { appt ->
            layoutPendingList.addView(buildPendingCard(appt))
            val spacer = View(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(8))
            }
            layoutPendingList.addView(spacer)
        }
    }

    private fun buildPendingCard(appt: AppointmentResponse): View {
        val card = layoutInflater.inflate(R.layout.item_secretary_pending_card, layoutPendingList, false)

        val patFn = appt.patient?.firstName ?: ""
        val patLn = appt.patient?.lastName  ?: ""

        card.findViewById<TextView>(R.id.tvSecPendingPatientName).text = "$patFn $patLn".trim()
        card.findViewById<TextView>(R.id.tvSecPendingDate).text        = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvSecPendingTime).text        = appt.requestedTime ?: "—"

        val initials = card.findViewById<TextView>(R.id.tvSecPendingInitials)
        initials.text = "${patFn.firstOrNull()?.uppercaseChar() ?: ""}${patLn.firstOrNull()?.uppercaseChar() ?: ""}"
        initials.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#7C3AED"))
        }

        card.setOnClickListener {
            val dashboard = activity as? SecretaryDashboardActivity
            dashboard?.switchTab("appointments")
            // Pass the appointment to appointments fragment
            (parentFragmentManager.findFragmentByTag("sec_appointments") as? SecretaryAppointmentsFragment)
                ?.openAppointment(appt)
        }

        return card
    }

    private fun formatDate(date: String?): String {
        if (date.isNullOrEmpty()) return "—"
        return try {
            val i = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val o = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
            o.format(i.parse(date)!!)
        } catch (_: Exception) { date }
    }

    private fun dpToPx(dp: Int) = (dp * resources.displayMetrics.density).toInt()
}