package com.daclan.mobile.feature.patient

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

class HomeFragment : Fragment() {

    private lateinit var tvWelcome:       TextView
    private lateinit var btnBookNew:      LinearLayout
    private lateinit var btnViewAll:      TextView
    private lateinit var tvStatTotal:     TextView
    private lateinit var tvStatConfirmed: TextView
    private lateinit var tvStatPending:   TextView
    private lateinit var tvStatCompleted: TextView
    private lateinit var progressAppts:   ProgressBar
    private lateinit var layoutEmpty:     LinearLayout
    private lateinit var layoutCards:     LinearLayout

    private val docColors = arrayOf(
        "#2563eb","#7c3aed","#059669","#f59e0b","#ef4444","#0891b2","#db2777","#16a34a"
    )
    // Fixed: parameter is Long? to match doctorId type
    private fun docColor(id: Long?) = docColors[((id ?: 0L) % docColors.size).toInt()]

    private val badgeMap = mapOf(
        "PENDING"   to Triple("#fef9c3","#854d0e","#fde047"),
        "CONFIRMED" to Triple("#f0fdf4","#059669","#bbf7d0"),
        "COMPLETED" to Triple("#eff6ff","#2563eb","#bfdbfe"),
        "REJECTED"  to Triple("#fef2f2","#991b1b","#fecaca"),
        "CANCELLED" to Triple("#f1f5f9","#64748b","#cbd5e1"),
        "EXPIRED"   to Triple("#fef9c3","#854d0e","#fde047")
    )

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_home, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        tvWelcome       = view.findViewById(R.id.tvWelcome)
        btnBookNew      = view.findViewById(R.id.btnBookNew)
        btnViewAll      = view.findViewById(R.id.btnViewAll)
        tvStatTotal     = view.findViewById(R.id.tvStatTotal)
        tvStatConfirmed = view.findViewById(R.id.tvStatConfirmed)
        tvStatPending   = view.findViewById(R.id.tvStatPending)
        tvStatCompleted = view.findViewById(R.id.tvStatCompleted)
        progressAppts   = view.findViewById(R.id.progressHomeAppts)
        layoutEmpty     = view.findViewById(R.id.layoutHomeEmpty)
        layoutCards     = view.findViewById(R.id.layoutHomeApptCards)

        val dashboard = activity as? PatientDashboardActivity
        tvWelcome.text = "Welcome back, ${dashboard?.getFirstName() ?: "there"}!"

        btnBookNew.setOnClickListener { dashboard?.switchTab("doctors") }
        btnViewAll.setOnClickListener { dashboard?.switchTab("appointments") }

        loadAppointments()
    }

    private fun loadAppointments() {
        progressAppts.visibility = View.VISIBLE
        layoutEmpty.visibility   = View.GONE
        layoutCards.visibility   = View.GONE

        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val resp = RetrofitClient.patientApi.getMyAppointments(
                    RetrofitClient.bearerToken(dashboard.getToken()))
                progressAppts.visibility = View.GONE

                if (resp.isSuccessful && resp.body()?.success == true) {
                    val all = resp.body()?.data ?: emptyList()
                    updateStats(all)
                    renderCards(all)
                } else {
                    showEmpty()
                }
            } catch (_: Exception) {
                progressAppts.visibility = View.GONE
                showEmpty()
            }
        }
    }

    private fun updateStats(all: List<AppointmentResponse>) {
        tvStatTotal.text     = all.size.toString()
        tvStatConfirmed.text = all.count { it.status?.uppercase() == "CONFIRMED" }.toString()
        tvStatPending.text   = all.count { it.status?.uppercase() == "PENDING"   }.toString()
        tvStatCompleted.text = all.count { it.status?.uppercase() == "COMPLETED" }.toString()
    }

    private fun renderCards(all: List<AppointmentResponse>) {
        val upcoming = all.filter {
            it.status?.uppercase() in listOf("PENDING", "CONFIRMED")
        }.take(4)

        layoutCards.removeAllViews()
        if (upcoming.isEmpty()) { showEmpty(); return }
        layoutCards.visibility = View.VISIBLE

        upcoming.chunked(2).forEach { pair ->
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
                wrap.addView(buildCard(appt))
                row.addView(wrap)
            }
            // Spacer for odd last item
            if (pair.size == 1) {
                row.addView(View(requireContext()).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                })
            }
            layoutCards.addView(row)
        }
    }

    private fun buildCard(appt: AppointmentResponse): View {
        val card   = layoutInflater.inflate(R.layout.item_home_appt_card, layoutCards, false)
        val fn     = appt.doctor?.firstName ?: ""
        val ln     = appt.doctor?.lastName  ?: ""
        val docId  = appt.doctor?.doctorId ?: appt.doctor?.id  // Long?
        val status = (appt.status ?: "").uppercase()

        card.findViewById<TextView>(R.id.tvHomeCardDoctorName).text = "Dr. $fn $ln".trim()
        card.findViewById<TextView>(R.id.tvHomeCardSpec).text       = appt.doctor?.specialization ?: ""
        card.findViewById<TextView>(R.id.tvHomeCardDate).text       = formatDate(appt.requestedDate)
        card.findViewById<TextView>(R.id.tvHomeCardTime).text       = appt.requestedTime ?: "—"

        val tvStatus = card.findViewById<TextView>(R.id.tvHomeCardStatus)
        tvStatus.text = status
        val (bg, text, border) = badgeMap[status] ?: badgeMap["PENDING"]!!
        tvStatus.background = GradientDrawable().apply {
            shape        = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(100).toFloat()
            setColor(Color.parseColor(bg))
            setStroke(dpToPx(1), Color.parseColor(border))
        }
        tvStatus.setTextColor(Color.parseColor(text))

        val tvInit = card.findViewById<TextView>(R.id.tvHomeCardInitials)
        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(docId)))
        }
        tvInit.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val ivPic = card.findViewById<ImageView>(R.id.ivHomeCardPic)
        appt.doctor?.profilePicture?.let { pic ->
            try {
                val bytes  = Base64.decode(pic.substringAfter(","), Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility  = View.VISIBLE
                tvInit.visibility = View.GONE
            } catch (_: Exception) { }
        }

        card.findViewById<TextView>(R.id.btnHomeCardViewDetails).setOnClickListener {
            (activity as? PatientDashboardActivity)?.switchTab("appointments")
        }
        return card
    }

    private fun showEmpty() {
        layoutCards.visibility = View.GONE
        layoutEmpty.visibility = View.VISIBLE
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