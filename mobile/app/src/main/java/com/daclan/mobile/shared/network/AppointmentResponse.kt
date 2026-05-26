package com.daclan.mobile.shared.network

data class AppointmentResponse(
    val id: Long? = null,
    val requestedDate: String? = null,
    val requestedTime: String? = null,
    val reasonForVisit: String? = null,
    val reason: String? = null,
    val status: String? = null,
    val doctor: DoctorInfo? = null,
    val patient: PatientInfo? = null,
    val completedAt: String? = null,
    val doctorNotes: String? = null,
    val cancelledAt: String? = null,
    val cancelledBy: String? = null,
    val cancelReason: String? = null,
    val rejectedAt: String? = null,
    val rejectedReason: String? = null,
    val rejectReason: String? = null,
    val expiredAt: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)