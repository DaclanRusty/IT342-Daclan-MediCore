package com.daclan.mobile.feature.patient

import android.app.AlertDialog
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.daclan.mobile.R
import com.daclan.mobile.shared.network.DataCache
import com.daclan.mobile.shared.network.DoctorSummary

class DoctorsFragment : Fragment() {

    private lateinit var layoutDoctors:   LinearLayout
    private lateinit var progressDoctors: ProgressBar
    private lateinit var layoutEmpty:     LinearLayout
    private lateinit var tvError:         TextView
    private lateinit var etSearch:        EditText

    private val docColors = arrayOf(
        "#2563eb","#7c3aed","#059669","#f59e0b","#ef4444","#0891b2","#db2777","#16a34a"
    )
    private fun docColor(id: Long?) = docColors[((id ?: 0L) % docColors.size).toInt()]

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, saved: Bundle?): View =
        inflater.inflate(R.layout.fragment_doctors, container, false)

    override fun onViewCreated(view: View, saved: Bundle?) {
        super.onViewCreated(view, saved)
        layoutDoctors   = view.findViewById(R.id.layoutDoctors)
        progressDoctors = view.findViewById(R.id.progressDoctors)
        layoutEmpty     = view.findViewById(R.id.layoutEmptyDoctors)
        tvError         = view.findViewById(R.id.tvErrorDoctors)
        etSearch        = view.findViewById(R.id.etSearchDoctors)

        etSearch.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) { filterDoctors(s.toString()) }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })

        loadFromCache()
    }

    fun loadFromCache() {
        if (!isAdded) return
        if (DataCache.doctorsLoaded) {
            progressDoctors.visibility = View.GONE
            renderDoctors(DataCache.doctors)
        } else {
            progressDoctors.visibility = View.VISIBLE
            layoutEmpty.visibility = View.GONE
            tvError.visibility = View.GONE
        }
    }

    private fun filterDoctors(query: String) {
        if (query.isBlank()) { renderDoctors(DataCache.doctors); return }
        val q = query.lowercase()
        renderDoctors(DataCache.doctors.filter {
            it.firstName?.lowercase()?.contains(q) == true ||
                    it.lastName?.lowercase()?.contains(q)  == true ||
                    it.specialization?.lowercase()?.contains(q) == true
        })
    }

    private fun renderDoctors(list: List<DoctorSummary>) {
        if (!isAdded) return
        layoutDoctors.removeAllViews()
        if (list.isEmpty()) { layoutEmpty.visibility = View.VISIBLE; return }
        layoutEmpty.visibility = View.GONE
        list.forEachIndexed { idx, doc ->
            layoutDoctors.addView(buildDoctorCard(doc))
            if (idx < list.size - 1) {
                val space = View(requireContext())
                space.layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(10))
                layoutDoctors.addView(space)
            }
        }
    }

    private fun buildDoctorCard(doc: DoctorSummary): View {
        val card = layoutInflater.inflate(R.layout.item_doctor_card, layoutDoctors, false)
        val fn = doc.firstName ?: ""
        val ln = doc.lastName  ?: ""

        card.findViewById<TextView>(R.id.tvDocName).text  = "Dr. $fn $ln".trim()
        card.findViewById<TextView>(R.id.tvDocSpec).text  = doc.specialization ?: "—"
        card.findViewById<TextView>(R.id.tvDocEmail).text = doc.email ?: ""

        val secView = card.findViewById<TextView>(R.id.tvDocSecretary)
        if (doc.secretary != null) {
            secView.text = "Secretary: ${doc.secretary.firstName ?: ""} ${doc.secretary.lastName ?: ""}".trim()
            secView.visibility = View.VISIBLE
        } else {
            secView.visibility = View.GONE
        }

        val tvInitials = card.findViewById<TextView>(R.id.tvDocInitials)
        tvInitials.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
        tvInitials.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(doc.doctorId)))
        }

        val ivPic = card.findViewById<android.widget.ImageView>(R.id.ivDocPic)
        if (!doc.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = android.util.Base64.decode(doc.profilePicture.substringAfter(","), android.util.Base64.DEFAULT)
                val bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility      = View.VISIBLE
                tvInitials.visibility = View.GONE
            } catch (_: Exception) {}
        }

        // View Profile button
        card.findViewById<Button>(R.id.btnViewProfile).setOnClickListener {
            showProfileDialog(doc)
        }

        // Book button
        card.findViewById<Button>(R.id.btnBookDoctor).setOnClickListener {
            val bookFrag = BookAppointmentFragment.newInstance(doc)
            requireActivity().supportFragmentManager
                .beginTransaction()
                .replace(R.id.fragmentContainer, bookFrag)
                .addToBackStack("doctors")
                .commit()
        }

        return card
    }

    private fun showProfileDialog(doc: DoctorSummary) {
        val fn = doc.firstName ?: ""
        val ln = doc.lastName  ?: ""

        val dialogView = layoutInflater.inflate(R.layout.dialog_doctor_profile, null)

        // Avatar initials + color
        val tvInit = dialogView.findViewById<TextView>(R.id.tvProfileDialogInitials)
        tvInit.text = "${fn.firstOrNull()?.uppercaseChar() ?: ""}${ln.firstOrNull()?.uppercaseChar() ?: ""}"
        tvInit.background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(docColor(doc.doctorId)))
        }

        // Profile pic
        val ivPic = dialogView.findViewById<android.widget.ImageView>(R.id.ivProfileDialogPic)
        if (!doc.profilePicture.isNullOrEmpty()) {
            try {
                val bytes  = android.util.Base64.decode(doc.profilePicture.substringAfter(","), android.util.Base64.DEFAULT)
                val bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                ivPic.setImageBitmap(bitmap)
                ivPic.visibility  = View.VISIBLE
                tvInit.visibility = View.GONE
            } catch (_: Exception) {}
        }

        // Populate all fields
        dialogView.findViewById<TextView>(R.id.tvProfileDialogName).text = "Dr. $fn $ln".trim()
        dialogView.findViewById<TextView>(R.id.tvProfileDialogSpec).text = doc.specialization ?: "—"
        dialogView.findViewById<TextView>(R.id.tvProfileDialogSpec2).text = doc.specialization ?: "—"
        dialogView.findViewById<TextView>(R.id.tvProfileDialogYoe).text =
            if (doc.yearsOfExperience != null) "${doc.yearsOfExperience} years" else "—"
        dialogView.findViewById<TextView>(R.id.tvProfileDialogBio).text =
            if (!doc.bio.isNullOrEmpty()) doc.bio else "No biography provided."

        val dialog = AlertDialog.Builder(requireContext(), R.style.MedicoreDialog)
            .setView(dialogView)
            .create()

        dialogView.findViewById<Button>(R.id.btnProfileDialogBook).setOnClickListener {
            dialog.dismiss()
            val bookFrag = BookAppointmentFragment.newInstance(doc)
            requireActivity().supportFragmentManager
                .beginTransaction()
                .replace(R.id.fragmentContainer, bookFrag)
                .addToBackStack("doctors")
                .commit()
        }

        dialogView.findViewById<android.widget.ImageView>(R.id.btnProfileDialogClose).setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun dpToPx(dp: Int) = (dp * resources.displayMetrics.density).toInt()
}