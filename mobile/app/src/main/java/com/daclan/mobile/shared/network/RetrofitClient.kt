package com.daclan.mobile.shared.network

import com.daclan.mobile.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(logging)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("ngrok-skip-browser-warning", "true")
                .build()
            chain.proceed(request)
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val instance: AuthApiService by lazy {
        retrofit.create(AuthApiService::class.java)
    }

    val patientApi: PatientApiService by lazy {
        retrofit.create(PatientApiService::class.java)
    }

    val doctorApi: DoctorApiService by lazy {
        retrofit.create(DoctorApiService::class.java)
    }

    val secretaryApi: SecretaryApiService by lazy {
        retrofit.create(SecretaryApiService::class.java)
    }

    fun bearerToken(token: String) = "Bearer $token"
}