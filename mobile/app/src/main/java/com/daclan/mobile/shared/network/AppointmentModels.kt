package com.daclan.mobile.shared.network

import com.google.gson.annotations.SerializedName


data class AppointmentDoctor(
    val id: Long? = null,
    val doctorId: Long? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val specialization: String? = null,
    val profilePicture: String? = null
)

data class AppointmentPatient(
    val id: Long? = null,
    val patientId: Long? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val profilePicture: String? = null
)

data class AppointmentListResponse(
    val success: Boolean?,
    val data: List<AppointmentResponse>?,
    val error: ErrorDetail?,
    val timestamp: String?
)