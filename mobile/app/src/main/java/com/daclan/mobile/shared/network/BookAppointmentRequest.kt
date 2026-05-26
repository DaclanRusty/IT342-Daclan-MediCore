package com.daclan.mobile.shared.network

import com.google.gson.annotations.SerializedName

data class BookAppointmentRequest(

        val doctorId:       Long,
        val requestedDate:  String,
        val requestedTime:  String,
        val reasonForVisit: String

)