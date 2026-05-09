package edu.cit.daclan.medicore.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientProfileResponse {

    // ── From User ─────────────────────────────────────────────────────────
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    // ── From Patient ──────────────────────────────────────────────────────
    private Long patientId;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;

    public PatientProfileResponse() {}

    // Getters
    public Long getUserId()              { return userId; }
    public String getEmail()             { return email; }
    public String getFirstName()         { return firstName; }
    public String getLastName()          { return lastName; }
    public String getPhoneNumber()       { return phoneNumber; }
    public String getRole()              { return role; }
    public String getStatus()            { return status; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public Long getPatientId()           { return patientId; }
    public LocalDate getDateOfBirth()    { return dateOfBirth; }
    public String getGender()            { return gender; }
    public String getAddress()           { return address; }

    // Setters
    public void setUserId(Long userId)                   { this.userId = userId; }
    public void setEmail(String email)                   { this.email = email; }
    public void setFirstName(String firstName)           { this.firstName = firstName; }
    public void setLastName(String lastName)             { this.lastName = lastName; }
    public void setPhoneNumber(String phoneNumber)       { this.phoneNumber = phoneNumber; }
    public void setRole(String role)                     { this.role = role; }
    public void setStatus(String status)                 { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt)    { this.createdAt = createdAt; }
    public void setPatientId(Long patientId)             { this.patientId = patientId; }
    public void setDateOfBirth(LocalDate dateOfBirth)    { this.dateOfBirth = dateOfBirth; }
    public void setGender(String gender)                 { this.gender = gender; }
    public void setAddress(String address)               { this.address = address; }

    // ── Builder ───────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId, patientId;
        private String email, firstName, lastName, phoneNumber, role, status, gender, address;
        private LocalDateTime createdAt;
        private LocalDate dateOfBirth;

        public Builder userId(Long v)              { this.userId = v; return this; }
        public Builder patientId(Long v)           { this.patientId = v; return this; }
        public Builder email(String v)             { this.email = v; return this; }
        public Builder firstName(String v)         { this.firstName = v; return this; }
        public Builder lastName(String v)          { this.lastName = v; return this; }
        public Builder phoneNumber(String v)       { this.phoneNumber = v; return this; }
        public Builder role(String v)              { this.role = v; return this; }
        public Builder status(String v)            { this.status = v; return this; }
        public Builder createdAt(LocalDateTime v)  { this.createdAt = v; return this; }
        public Builder dateOfBirth(LocalDate v)    { this.dateOfBirth = v; return this; }
        public Builder gender(String v)            { this.gender = v; return this; }
        public Builder address(String v)           { this.address = v; return this; }

        public PatientProfileResponse build() {
            PatientProfileResponse r = new PatientProfileResponse();
            r.userId      = this.userId;
            r.patientId   = this.patientId;
            r.email       = this.email;
            r.firstName   = this.firstName;
            r.lastName    = this.lastName;
            r.phoneNumber = this.phoneNumber;
            r.role        = this.role;
            r.status      = this.status;
            r.createdAt   = this.createdAt;
            r.dateOfBirth = this.dateOfBirth;
            r.gender      = this.gender;
            r.address     = this.address;
            return r;
        }
    }
}