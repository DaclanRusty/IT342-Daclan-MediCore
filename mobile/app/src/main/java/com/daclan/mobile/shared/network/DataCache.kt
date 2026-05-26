package com.daclan.mobile.shared.network

object DataCache {
    var appointments: List<AppointmentResponse> = emptyList()
    var doctors:      List<DoctorSummary>        = emptyList()
    var profile:      PatientProfile?            = null

    var appointmentsLoaded = false
    var doctorsLoaded      = false
    var profileLoaded      = false

    fun clear() {
        appointments       = emptyList()
        doctors            = emptyList()
        profile            = null
        appointmentsLoaded = false
        doctorsLoaded      = false
        profileLoaded      = false
    }
}