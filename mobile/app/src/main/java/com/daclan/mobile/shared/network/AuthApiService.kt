package com.daclan.mobile.shared.network

import retrofit2.Response
import retrofit2.http.*

// ═══════════════════════════════════════════════════════════════
// REQUEST DTOs
// ═══════════════════════════════════════════════════════════════

data class RegisterRequest(
    val firstname: String,
    val lastname: String,
    val email: String,
    val password: String,
    val phoneNumber: String = "",
    val role: String,
    val googleVerified: Boolean = true, // ✅ MUST be true — backend requires Google verification
    val dateOfBirth: String = "",
    val gender: String = "",
    val address: String = "",
    val licenseNumber: String = "",
    val specialization: String = "",
    val doctorId: Long? = null
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class GoogleAuthRequest(
    val credential: String  // backend expects "credential" field
)

// ═══════════════════════════════════════════════════════════════
// RESPONSE DTOs — matching backend AuthResponse.java exactly
//
// Backend buildAuthResponse returns:
// {
//   "accessToken": "...",
//   "refreshToken": "...",
//   "message": "...",
//   "user": {
//     "email": "...",
//     "firstname": "...",   ← lowercase
//     "lastname": "...",    ← lowercase
//     "role": "..."
//   }
// }
//
// Wrapped in ApiResponse:
// {
//   "success": true,
//   "data": { ...above... },
//   "timestamp": "..."
// }
// On error:
// {
//   "success": false,
//   "error": { "code": "...", "message": "..." },
//   "timestamp": "..."
// }
// ═══════════════════════════════════════════════════════════════

data class UserInfo(
    val email: String?,
    val firstname: String?,   // ✅ lowercase — matches backend
    val lastname: String?,    // ✅ lowercase — matches backend
    val role: String?
)

data class AuthResponse(
    val accessToken: String?,  // ✅ "accessToken" not "token"
    val refreshToken: String?,
    val message: String?,      // ✅ for doctor/secretary pending messages
    val user: UserInfo?        // ✅ nested user object
)

data class ErrorDetail(
    val code: String?,
    val message: String?,
    val details: Any?
)

data class ApiResponse<T>(
    val success: Boolean?,
    val data: T?,
    val error: ErrorDetail?,
    val timestamp: String?
) {
    fun errorMessage(): String =
        error?.message ?: "An unexpected error occurred."
}

data class AvailableDoctor(
    val doctorId: Long,
    val firstname: String?,
    val lastname: String?,
    val specialization: String?,
    val email: String?,
    val profilePicture: String?
)

// ═══════════════════════════════════════════════════════════════
// API Interface
// ═══════════════════════════════════════════════════════════════

interface AuthApiService {

    @POST("api/v1/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<ApiResponse<AuthResponse>>

    @POST("api/v1/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<ApiResponse<AuthResponse>>

    @POST("api/v1/auth/google")
    suspend fun googleLogin(
        @Body request: GoogleAuthRequest
    ): Response<ApiResponse<AuthResponse>>

    @GET("api/v1/auth/doctors/available")
    suspend fun getAvailableDoctors(): Response<ApiResponse<List<AvailableDoctor>>>
}