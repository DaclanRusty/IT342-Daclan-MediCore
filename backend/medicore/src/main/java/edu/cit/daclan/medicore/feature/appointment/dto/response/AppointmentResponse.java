package edu.cit.daclan.medicore.feature.appointment.dto.response;

import edu.cit.daclan.medicore.feature.appointment.entity.AppointmentStatus;
import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long id;
    private String requestedDate;
    private String requestedTime;
    private String reasonForVisit;
    private AppointmentStatus status;
    private DoctorInfo doctor;
    private PatientInfo patient;

    private LocalDateTime completedAt;
    private String doctorNotes;

    private LocalDateTime cancelledAt;
    private String cancelReason;

    private LocalDateTime rejectedAt;
    private String rejectedReason;

    private LocalDateTime expiredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AppointmentResponse() {}

    public Long getId() { return id; }
    public String getRequestedDate() { return requestedDate; }
    public String getRequestedTime() { return requestedTime; }
    public String getReasonForVisit() { return reasonForVisit; }
    public AppointmentStatus getStatus() { return status; }
    public DoctorInfo getDoctor() { return doctor; }
    public PatientInfo getPatient() { return patient; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public String getDoctorNotes() { return doctorNotes; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public String getCancelReason() { return cancelReason; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public String getRejectedReason() { return rejectedReason; }
    public LocalDateTime getExpiredAt() { return expiredAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setRequestedDate(String d) { this.requestedDate = d; }
    public void setRequestedTime(String t) { this.requestedTime = t; }
    public void setReasonForVisit(String r) { this.reasonForVisit = r; }
    public void setStatus(AppointmentStatus s) { this.status = s; }
    public void setDoctor(DoctorInfo d) { this.doctor = d; }
    public void setPatient(PatientInfo p) { this.patient = p; }
    public void setCompletedAt(LocalDateTime t) { this.completedAt = t; }
    public void setDoctorNotes(String n) { this.doctorNotes = n; }
    public void setCancelledAt(LocalDateTime t) { this.cancelledAt = t; }
    public void setCancelReason(String r) { this.cancelReason = r; }
    public void setRejectedAt(LocalDateTime t) { this.rejectedAt = t; }
    public void setRejectedReason(String r) { this.rejectedReason = r; }
    public void setExpiredAt(LocalDateTime t) { this.expiredAt = t; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }

    public static class DoctorInfo {
        private Long doctorId;
        private String firstName;
        private String lastName;
        private String specialization;
        private String profilePicture;

        public DoctorInfo() {}

        public Long getDoctorId() { return doctorId; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getSpecialization() { return specialization; }
        public String getProfilePicture() { return profilePicture; }

        public void setDoctorId(Long id) { this.doctorId = id; }
        public void setFirstName(String f) { this.firstName = f; }
        public void setLastName(String l) { this.lastName = l; }
        public void setSpecialization(String s) { this.specialization = s; }
        public void setProfilePicture(String p) { this.profilePicture = p; }
    }

    public static class PatientInfo {
        private Long patientId;
        private String firstName;
        private String lastName;
        private String email;
        private String profilePicture;

        public PatientInfo() {}

        public Long getPatientId() { return patientId; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getEmail() { return email; }
        public String getProfilePicture() { return profilePicture; }

        public void setPatientId(Long id) { this.patientId = id; }
        public void setFirstName(String f) { this.firstName = f; }
        public void setLastName(String l) { this.lastName = l; }
        public void setEmail(String e) { this.email = e; }
        public void setProfilePicture(String p) { this.profilePicture = p; }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final AppointmentResponse r = new AppointmentResponse();

        public Builder id(Long id) { r.setId(id); return this; }
        public Builder requestedDate(String d) { r.setRequestedDate(d); return this; }
        public Builder requestedTime(String t) { r.setRequestedTime(t); return this; }
        public Builder reasonForVisit(String rfv) { r.setReasonForVisit(rfv); return this; }
        public Builder status(AppointmentStatus s) { r.setStatus(s); return this; }
        public Builder doctor(DoctorInfo d) { r.setDoctor(d); return this; }
        public Builder patient(PatientInfo p) { r.setPatient(p); return this; }
        public Builder completedAt(LocalDateTime t) { r.setCompletedAt(t); return this; }
        public Builder doctorNotes(String n) { r.setDoctorNotes(n); return this; }
        public Builder cancelledAt(LocalDateTime t) { r.setCancelledAt(t); return this; }
        public Builder cancelReason(String rsn) { r.setCancelReason(rsn); return this; }
        public Builder rejectedAt(LocalDateTime t) { r.setRejectedAt(t); return this; }
        public Builder rejectedReason(String rsn) { r.setRejectedReason(rsn); return this; }
        public Builder expiredAt(LocalDateTime t) { r.setExpiredAt(t); return this; }
        public Builder createdAt(LocalDateTime t) { r.setCreatedAt(t); return this; }
        public Builder updatedAt(LocalDateTime t) { r.setUpdatedAt(t); return this; }

        public AppointmentResponse build() {
            return r;
        }
    }
}