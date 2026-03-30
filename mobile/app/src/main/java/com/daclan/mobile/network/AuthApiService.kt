package com.daclan.mobile.network

import retrofit2.Response
import retrofit2.http.*

// ── Request DTOs ────────────────────────────────────────────

data class RegisterRequest(
    val firstname: String,
    val lastname: String,
    val email: String,
    val password: String,
    val phoneNumber: String = "",
    val role: String,
    val googleVerified: Boolean = true, // always true on mobile

    // Patient only
    val dateOfBirth: String = "",
    val gender: String = "",
    val address: String = "",

    // Doctor only
    val licenseNumber: String = "",
    val specialization: String = "",

    // Secretary only
    val doctorId: Long? = null
)

data class LoginRequest(
    val email: String,
    val password: String
)

// ── Response DTOs ───────────────────────────────────────────

data class UserInfo(
    val email: String?,
    val firstname: String?,
    val lastname: String?,
    val role: String?
)

data class AuthResponse(
    val accessToken: String?,
    val refreshToken: String?,
    val message: String?,
    val user: UserInfo?
)

data class ApiResponse<T>(
    val success: Boolean?,
    val data: T?,
    val message: String?
)

data class AvailableDoctor(
    val doctorId: Long,
    val firstname: String?,
    val lastname: String?,
    val specialization: String?,
    val email: String?
)

// ── API Interface ───────────────────────────────────────────

interface AuthApiService {

    @POST("api/v1/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<ApiResponse<AuthResponse>>

    @POST("api/v1/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<ApiResponse<AuthResponse>>

    @GET("api/v1/auth/doctors/available")
    suspend fun getAvailableDoctors(): Response<ApiResponse<List<AvailableDoctor>>>
}