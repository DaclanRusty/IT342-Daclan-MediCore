package edu.cit.daclan.medicore.feature.appointment.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RejectAppointmentRequest {

    @JsonProperty("rejected_reason")
    private String rejectedReason; // optional reason from secretary

    public RejectAppointmentRequest() {}

    public String getRejectedReason()           { return rejectedReason; }
    public void setRejectedReason(String r)     { this.rejectedReason = r; }
}
