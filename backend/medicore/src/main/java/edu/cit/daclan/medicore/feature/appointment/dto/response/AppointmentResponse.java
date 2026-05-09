package edu.cit.daclan.medicore.feature.appointment.dto.response;

import edu.cit.daclan.medicore.feature.appointment.entity.AppointmentStatus;
import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long             id;
    private String           requestedDate;
    private String           requestedTime;
    private String           reasonForVisit;
    private AppointmentStatus status;
    private DoctorInfo       doctor;
    private PatientInfo      patient;

    // Completion
    private LocalDateTime    completedAt;
    private String           doctorNotes;

    // Cancellation
    private LocalDateTime    cancelledAt;
    private String           cancelReason;

    // Rejection
    private LocalDateTime    rejectedAt;
    private String           rejectedReason;

    private LocalDateTime    createdAt;
    private LocalDateTime    updatedAt;

    public AppointmentResponse() {}

    // Getters
    public Long getId()                     { return id; }
    public String getRequestedDate()        { return requestedDate; }
    public String getRequestedTime()        { return requestedTime; }
    public String getReasonForVisit()       { return reasonForVisit; }
    public AppointmentStatus getStatus()    { return status; }
    public DoctorInfo getDoctor()           { return doctor; }
    public PatientInfo getPatient()         { return patient; }
    public LocalDateTime getCompletedAt()   { return completedAt; }
    public String getDoctorNotes()          { return doctorNotes; }
    public LocalDateTime getCancelledAt()   { return cancelledAt; }
    public String getCancelReason()         { return cancelReason; }
    public LocalDateTime getRejectedAt()    { return rejectedAt; }
    public String getRejectedReason()       { return rejectedReason; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
    public LocalDateTime getUpdatedAt()     { return updatedAt; }

    // Setters
    public void setId(Long id)                          { this.id = id; }
    public void setRequestedDate(String d)              { this.requestedDate = d; }
    public void setRequestedTime(String t)              { this.requestedTime = t; }
    public void setReasonForVisit(String r)             { this.reasonForVisit = r; }
    public void setStatus(AppointmentStatus s)          { this.status = s; }
    public void setDoctor(DoctorInfo d)                 { this.doctor = d; }
    public void setPatient(PatientInfo p)               { this.patient = p; }
    public void setCompletedAt(LocalDateTime t)         { this.completedAt = t; }
    public void setDoctorNotes(String n)                { this.doctorNotes = n; }
    public void setCancelledAt(LocalDateTime t)         { this.cancelledAt = t; }
    public void setCancelReason(String r)               { this.cancelReason = r; }
    public void setRejectedAt(LocalDateTime t)          { this.rejectedAt = t; }
    public void setRejectedReason(String r)             { this.rejectedReason = r; }
    public void setCreatedAt(LocalDateTime t)           { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)           { this.updatedAt = t; }

    // ── Nested DTOs ─────────────────────────────────────────────────────────
    public static class DoctorInfo {
        private Long   doctorId;
        private String firstName, lastName, specialization, profilePicture;

        public DoctorInfo() {}
        public Long   getDoctorId()       { return doctorId; }
        public String getFirstName()      { return firstName; }
        public String getLastName()       { return lastName; }
        public String getSpecialization() { return specialization; }
        public String getProfilePicture() { return profilePicture; }
        public void setDoctorId(Long id)        { this.doctorId = id; }
        public void setFirstName(String f)      { this.firstName = f; }
        public void setLastName(String l)       { this.lastName = l; }
        public void setSpecialization(String s) { this.specialization = s; }
        public void setProfilePicture(String p) { this.profilePicture = p; }
    }

    public static class PatientInfo {
        private Long   patientId;
        private String firstName, lastName, email;

        public PatientInfo() {}
        public Long   getPatientId() { return patientId; }
        public String getFirstName() { return firstName; }
        public String getLastName()  { return lastName; }
        public String getEmail()     { return email; }
        public void setPatientId(Long id)   { this.patientId = id; }
        public void setFirstName(String f)  { this.firstName = f; }
        public void setLastName(String l)   { this.lastName = l; }
        public void setEmail(String e)      { this.email = e; }
    }

    // ── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String requestedDate, requestedTime, reasonForVisit;
        private AppointmentStatus status;
        private DoctorInfo doctor;
        private PatientInfo patient;
        private LocalDateTime completedAt, cancelledAt, rejectedAt, createdAt, updatedAt;
        private String doctorNotes, cancelReason, rejectedReason;

        public Builder id(Long id)                          { this.id = id; return this; }
        public Builder requestedDate(String d)              { this.requestedDate = d; return this; }
        public Builder requestedTime(String t)              { this.requestedTime = t; return this; }
        public Builder reasonForVisit(String r)             { this.reasonForVisit = r; return this; }
        public Builder status(AppointmentStatus s)          { this.status = s; return this; }
        public Builder doctor(DoctorInfo d)                 { this.doctor = d; return this; }
        public Builder patient(PatientInfo p)               { this.patient = p; return this; }
        public Builder completedAt(LocalDateTime t)         { this.completedAt = t; return this; }
        public Builder doctorNotes(String n)                { this.doctorNotes = n; return this; }
        public Builder cancelledAt(LocalDateTime t)         { this.cancelledAt = t; return this; }
        public Builder cancelReason(String r)               { this.cancelReason = r; return this; }
        public Builder rejectedAt(LocalDateTime t)          { this.rejectedAt = t; return this; }
        public Builder rejectedReason(String r)             { this.rejectedReason = r; return this; }
        public Builder createdAt(LocalDateTime t)           { this.createdAt = t; return this; }
        public Builder updatedAt(LocalDateTime t)           { this.updatedAt = t; return this; }

        public AppointmentResponse build() {
            AppointmentResponse r = new AppointmentResponse();
            r.id             = id;
            r.requestedDate  = requestedDate;
            r.requestedTime  = requestedTime;
            r.reasonForVisit = reasonForVisit;
            r.status         = status;
            r.doctor         = doctor;
            r.patient        = patient;
            r.completedAt    = completedAt;
            r.doctorNotes    = doctorNotes;
            r.cancelledAt    = cancelledAt;
            r.cancelReason   = cancelReason;
            r.rejectedAt     = rejectedAt;
            r.rejectedReason = rejectedReason;
            r.createdAt      = createdAt;
            r.updatedAt      = updatedAt;
            return r;
        }
    }
}
