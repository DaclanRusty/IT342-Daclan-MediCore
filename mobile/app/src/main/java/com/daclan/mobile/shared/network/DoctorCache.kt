package com.daclan.mobile.shared.network

object DoctorCache {
    var appointments:      List<DoctorAppointmentResponse> = emptyList()
    var secretaryRequests: List<SecretaryRequest>          = emptyList()
    var profile:           DoctorProfile?                  = null

    var appointmentsLoaded = false
    var secretaryLoaded    = false
    var profileLoaded      = false

    fun clear() {
        appointments       = emptyList()
        secretaryRequests  = emptyList()
        profile            = null
        appointmentsLoaded = false
        secretaryLoaded    = false
        profileLoaded      = false
    }
}