package edu.cit.daclan.medicore.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CompleteAppointmentRequest {

    @JsonProperty("doctor_notes")
    private String doctorNotes; // optional

    public CompleteAppointmentRequest() {}

    public String getDoctorNotes()          { return doctorNotes; }
    public void setDoctorNotes(String n)    { this.doctorNotes = n; }
}