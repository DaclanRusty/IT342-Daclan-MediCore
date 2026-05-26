package edu.cit.daclan.medicore.feature.appointment.dto.request;


public class AppointmentRequest {

    private Long doctorId;
    private String requestedDate;
    private String requestedTime;
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