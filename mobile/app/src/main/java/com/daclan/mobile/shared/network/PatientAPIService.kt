package com.daclan.mobile.shared.network

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

// ── Appointment Response ───────────────────────────────────────────────────
data class DoctorInfo(
    val doctorId:       Long?   = null,
    val id:             Long?   = null,
    val firstName:      String? = null,
    val lastName:       String? = null,
    val specialization: String? = null,
    val email:          String? = null,
    val profilePicture: String? = null
)

data class PatientInfo(
    val patientId:      Long?   = null,
    val firstName:      String? = null,
    val lastName:       String? = null,
    val email:          String? = null,
    val profilePicture: String? = null
)

data class DoctorSummary(
    val doctorId:          Long?   = null,
    val firstName:         String? = null,
    val lastName:          String? = null,
    val specialization:    String? = null,
    val email:             String? = null,
    val profilePicture:    String? = null,
    val status:            String? = null,
    val yearsOfExperience: Int?    = null,  // ← ADD
    val bio:               String? = null,  // ← ADD
    val secretary:         SecretaryInfo? = null
)

data class SecretaryInfo(
    val secretaryId: Long?   = null,
    val firstName:   String? = null,
    val lastName:    String? = null,
    val email:       String? = null
)

// ── Patient Profile ────────────────────────────────────────────────────────
data class PatientProfile(
    val userId:         Long?   = null,
    val email:          String? = null,
    val firstName:      String? = null,
    val lastName:       String? = null,
    val phoneNumber:    String? = null,
    val dateOfBirth:    String? = null,
    val gender:         String? = null,
    val address:        String? = null,
    val profilePicture: String? = null,
    val status:         String? = null,
    val createdAt:      String? = null
)

data class PatientProfileUpdateRequest(
    val firstName:   String,
    val lastName:    String,
    val phoneNumber: String,
    val address:     String
)

// ── Patient API Service ────────────────────────────────────────────────────
interface PatientApiService {

    @GET("api/v1/appointments/me")
    suspend fun getMyAppointments(
        @Header("Authorization") token: String
    ): Response<ApiResponse<List<AppointmentResponse>>>

    @POST("api/v1/appointments")
    suspend fun bookAppointment(
        @Header("Authorization") token: String,
        @Body request: BookAppointmentRequest
    ): Response<ApiResponse<AppointmentResponse>>

    @GET("api/v1/doctors/with-secretary")
    suspend fun getAllDoctors(
        @Header("Authorization") token: String
    ): Response<ApiResponse<List<DoctorSummary>>>

    @GET("api/v1/appointments/taken-slots")
    suspend fun getTakenSlots(
        @Header("Authorization") token: String,
        @Query("doctorId") doctorId: Long,
        @Query("date") date: String
    ): Response<ApiResponse<List<String>>>

    @GET("api/v1/patient/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<ApiResponse<PatientProfile>>

    @PUT("api/v1/patient/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: PatientProfileUpdateRequest
    ): Response<ApiResponse<PatientProfile>>

    @PUT("api/v1/patient/profile/picture")
    suspend fun uploadProfilePicture(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<ApiResponse<PatientProfile>>

    @GET("api/v1/health-tips")
    suspend fun getHealthTips(): Response<ApiResponse<List<String>>>
}