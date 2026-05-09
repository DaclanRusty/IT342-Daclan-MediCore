package edu.cit.daclan.medicore.feature.appointment.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AppointmentRequest {

    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("requested_date")
    private String requestedDate;

    @JsonProperty("requested_time")
    private String requestedTime;

    @JsonProperty("reason_for_visit")
    private String reasonForVisit;

    public AppointmentRequest() {}

    public Long getDoctorId()          { return doctorId; }
    public String getRequestedDate()   { return requestedDate; }
    public String getRequestedTime()   { return requestedTime; }
    public String getReasonForVisit()  { return reasonForVisit; }

    public void setDoctorId(Long d)         { this.doctorId = d; }
    public void setRequestedDate(String d)  { this.requestedDate = d; }
    public void setRequestedTime(String t)  { this.requestedTime = t; }
    public void setReasonForVisit(String r) { this.reasonForVisit = r; }
}
