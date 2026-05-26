package com.daclan.mobile.shared.network

object SecretaryDataCache {
    var appointments: List<AppointmentResponse> = emptyList()
    var appointmentsLoaded: Boolean = false

    var profile: SecretaryProfile? = null
    var profileLoaded: Boolean = false

    fun clear() {
        appointments     = emptyList()
        appointmentsLoaded = false
        profile          = null
        profileLoaded    = false
    }
}