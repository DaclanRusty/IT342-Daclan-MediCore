package edu.cit.daclan.medicore.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CancelAppointmentRequest {

    @JsonProperty("cancel_reason")
    private String cancelReason; // e.g. "No-show", "Doctor unavailable"

    public CancelAppointmentRequest() {}

    public String getCancelReason()         { return cancelReason; }
    public void setCancelReason(String r)   { this.cancelReason = r; }
}