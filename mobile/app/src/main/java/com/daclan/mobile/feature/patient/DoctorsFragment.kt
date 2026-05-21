package com.daclan.mobile.feature.patient

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.DoctorSummary
import com.daclan.mobile.shared.network.RetrofitClient
import kotlinx.coroutines.launch

class DoctorsFragment : Fragment() {

    private lateinit var layoutDoctors: LinearLayout
    private lateinit var progressDoctors: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var tvError: TextView
    private lateinit var etSearch: EditText

    private var allDoctors: List<DoctorSummary> = emptyList()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctors, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)

        layoutDoctors   = view.findViewById(R.id.layoutDoctors)
        progressDoctors = view.findViewById(R.id.progressDoctors)
        tvEmpty         = view.findViewById(R.id.tvEmptyDoctors)
        tvError         = view.findViewById(R.id.tvErrorDoctors)
        etSearch        = view.findViewById(R.id.etSearchDoctors)

        etSearch.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) { filterDoctors(s.toString()) }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })

        loadDoctors()
    }

    private fun loadDoctors() {
        progressDoctors.visibility = View.VISIBLE
        layoutDoctors.removeAllViews()
        tvEmpty.visibility = View.GONE
        tvError.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val dashboard = activity as? PatientDashboardActivity ?: return@launch
                val token     = dashboard.getToken()
                val resp      = RetrofitClient.patientApi.getAllDoctors(RetrofitClient.bearerToken(token))
                progressDoctors.visibility = View.GONE
                if (resp.isSuccessful && resp.body()?.success == true) {
                    allDoctors = resp.body()?.data ?: emptyList()
                    renderDoctors(allDoctors)
                } else {
                    tvError.text       = "Failed to load doctors."
                    tvError.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                progressDoctors.visibility = View.GONE
                tvError.text       = "Connection error."
                tvError.visibility = View.VISIBLE
            }
        }
    }

    private fun filterDoctors(query: String) {
        if (query.isBlank()) { renderDoctors(allDoctors); return }
        val q = query.lowercase()
        renderDoctors(allDoctors.filter {
            it.firstName?.lowercase()?.contains(q) == true ||
                    it.lastName?.lowercase()?.contains(q)  == true ||
                    it.specialization?.lowercase()?.contains(q) == true
        })
    }

    private fun renderDoctors(list: List<DoctorSummary>) {
        layoutDoctors.removeAllViews()
        if (list.isEmpty()) { tvEmpty.visibility = View.VISIBLE; return }
        tvEmpty.visibility = View.GONE
        list.forEachIndexed { idx, doc ->
            layoutDoctors.addView(buildDoctorCard(doc))
            if (idx < list.size - 1) {
                val space = View(requireContext())
                space.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, 10)
                layoutDoctors.addView(space)
            }
        }
    }

    private fun buildDoctorCard(doc: DoctorSummary): View {
        val card = layoutInflater.inflate(R.layout.item_doctor_card, layoutDoctors, false)

        card.findViewById<TextView>(R.id.tvDocName).text =
            "Dr. ${doc.firstName ?: ""} ${doc.lastName ?: ""}".trim()
        card.findViewById<TextView>(R.id.tvDocSpec).text  = doc.specialization ?: "General Medicine"
        card.findViewById<TextView>(R.id.tvDocEmail).text = doc.email ?: ""

        val secView = card.findViewById<TextView>(R.id.tvDocSecretary)
        if (doc.secretary != null) {
            secView.text = "Secretary: ${doc.secretary.firstName ?: ""} ${doc.secretary.lastName ?: ""}".trim()
            secView.visibility = View.VISIBLE
        } else {
            secView.visibility = View.GONE
        }

        val tvInitials = card.findViewById<TextView>(R.id.tvDocInitials)
        val fn = doc.firstName ?: ""
        val ln = doc.lastName  ?: ""
        tvInitials.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"

        val ivPic = card.findViewById<ImageView>(R.id.ivDocPic)
        if (doc.profilePicture != null) {
            try {
                val bytes  = android.util.Base64.decode(
                    doc.profilePicture.substringAfter(","), android.util.Base64.DEFAULT)
                val bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility      = View.VISIBLE
                tvInitials.visibility = View.GONE
            } catch (_: Exception) {}
        }

        card.findViewById<Button>(R.id.btnBookDoctor).setOnClickListener {
            val bookFrag = BookAppointmentFragment.newInstance(doc)
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, bookFrag)
                .addToBackStack(null)
                .commit()
        }

        return card
    }
}