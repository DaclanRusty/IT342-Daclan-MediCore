package com.daclan.mobile.shared.network

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

// ── Doctor Appointment Response ───────────────────────────────────────────
data class DoctorAppointmentResponse(
    val id:             Long?   = null,
    val requestedDate:  String? = null,
    val requestedTime:  String? = null,
    @SerializedName("reasonForVisit") val reason: String? = null,
    val status:         String? = null,
    val doctorNotes:    String? = null,
    val cancelReason:   String? = null,
    val cancelledBy:    String? = null,
    val rejectedReason: String? = null,
    val completedAt:    String? = null,
    val cancelledAt:    String? = null,
    val createdAt:      String? = null,
    val patient:        PatientInfo? = null
) {
    fun errorMessage(): String? = null
    fun resolvedReason(): String? = reason
}

// ── Doctor Profile ────────────────────────────────────────────────────────
data class DoctorProfile(
    val doctorId:          Long?   = null,
    val firstName:         String? = null,
    val lastName:          String? = null,
    val email:             String? = null,
    val phoneNumber:       String? = null,
    val specialization:    String? = null,
    val yearsOfExperience: Int?    = null,
    val bio:               String? = null,
    val profilePicture:    String? = null,
    val status:            String? = null,
    val createdAt:         String? = null
)

// ── Secretary Request ─────────────────────────────────────────────────────
data class SecretaryRequest(
    val secretaryId:    Long?   = null,
    val firstName:      String? = null,
    val lastName:       String? = null,
    val email:          String? = null,
    val phoneNumber:    String? = null,
    val profilePicture: String? = null,
    val status:         String? = null,
    val requestedAt:    String? = null
)

// ── Request bodies ────────────────────────────────────────────────────────
data class CompleteAppointmentRequest(
    val doctorNotes: String? = null
)

data class CancelAppointmentRequest(
    val cancelReason: String? = null
)

data class DoctorProfileUpdateRequest(
    val firstName:         String,
    val lastName:          String,
    val phoneNumber:       String? = null,
    val specialization:    String? = null,
    val yearsOfExperience: Int?    = null,
    val bio:               String? = null,
    val currentPassword:   String? = null,
    val newPassword:       String? = null
)

// ── Doctor API Service ────────────────────────────────────────────────────
interface DoctorApiService {

    @GET("api/v1/appointments/doctor")
    suspend fun getMyAppointments(
        @Header("Authorization") token: String
    ): Response<ApiResponse<List<DoctorAppointmentResponse>>>

    @PUT("api/v1/appointments/{id}/complete")
    suspend fun completeAppointment(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body request: CompleteAppointmentRequest
    ): Response<ApiResponse<DoctorAppointmentResponse>>

    @PUT("api/v1/appointments/{id}/cancel")
    suspend fun cancelAppointment(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body request: CancelAppointmentRequest
    ): Response<ApiResponse<DoctorAppointmentResponse>>

    @GET("api/v1/doctor/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<ApiResponse<DoctorProfile>>

    @PUT("api/v1/doctor/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: DoctorProfileUpdateRequest
    ): Response<ApiResponse<DoctorProfile>>

    @PUT("api/v1/doctor/profile/picture")
    suspend fun uploadProfilePicture(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<ApiResponse<DoctorProfile>>

    @GET("api/v1/doctor/secretary-requests")
    suspend fun getSecretaryRequests(
        @Header("Authorization") token: String
    ): Response<ApiResponse<List<SecretaryRequest>>>

    @PUT("api/v1/doctor/secretary-requests/{secretaryId}/approve")
    suspend fun approveSecretary(
        @Header("Authorization") token: String,
        @Path("secretaryId") secretaryId: Long
    ): Response<ApiResponse<SecretaryRequest>>

    @PUT("api/v1/doctor/secretary-requests/{secretaryId}/reject")
    suspend fun rejectSecretary(
        @Header("Authorization") token: String,
        @Path("secretaryId") secretaryId: Long
    ): Response<ApiResponse<SecretaryRequest>>
}