package com.daclan.mobile.shared.network

import retrofit2.Response
import retrofit2.http.*

data class SecretaryProfile(
    val secretaryId:    Long?          = null,
    val email:          String?        = null,
    val firstName:      String?        = null,
    val lastName:       String?        = null,
    val phoneNumber:    String?        = null,
    val profilePicture: String?        = null,
    val status:         String?        = null,
    val assignedDoctor: DoctorSummary? = null
)

data class SecretaryProfileUpdateRequest(
    val firstName:   String,
    val lastName:    String,
    val phoneNumber: String
)

interface SecretaryApiService {

    @GET("api/v1/secretary/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<ApiResponse<SecretaryProfile>>

    @PUT("api/v1/secretary/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: SecretaryProfileUpdateRequest
    ): Response<ApiResponse<SecretaryProfile>>

    @PUT("api/v1/secretary/profile/picture")
    suspend fun uploadProfilePicture(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<ApiResponse<SecretaryProfile>>

    @GET("api/v1/appointments/secretary")
    suspend fun getAppointments(
        @Header("Authorization") token: String
    ): Response<AppointmentListResponse>

    @PUT("api/v1/appointments/{id}/confirm")
    suspend fun confirmAppointment(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ApiResponse<AppointmentResponse>>

    @PUT("api/v1/appointments/{id}/reject")
    suspend fun rejectAppointment(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body body: Map<String, String?>
    ): Response<ApiResponse<AppointmentResponse>>

    @PUT("api/v1/appointments/{id}/cancel")
    suspend fun cancelAppointment(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body body: Map<String, String?>
    ): Response<ApiResponse<AppointmentResponse>>
}