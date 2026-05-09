package edu.cit.daclan.medicore.feature.patient.dto.request;

import java.time.LocalDate;

public class PatientProfileRequest {

    // ── User fields (editable) ────────────────────────────────────────────
    private String firstName;
    private String lastName;
    private String phoneNumber;

    // ── Patient-specific fields (editable) ───────────────────────────────
    private LocalDate dateOfBirth;
    private String gender;
    private String address;

    // ── Password change (optional — only applied if both fields are provided) ─
    private String currentPassword;
    private String newPassword;

    public PatientProfileRequest() {}

    // Getters
    public String getFirstName()        { return firstName; }
    public String getLastName()         { return lastName; }
    public String getPhoneNumber()      { return phoneNumber; }
    public LocalDate getDateOfBirth()   { return dateOfBirth; }
    public String getGender()           { return gender; }
    public String getAddress()          { return address; }
    public String getCurrentPassword()  { return currentPassword; }
    public String getNewPassword()      { return newPassword; }

    // Setters
    public void setFirstName(String firstName)            { this.firstName = firstName; }
    public void setLastName(String lastName)              { this.lastName = lastName; }
    public void setPhoneNumber(String phoneNumber)        { this.phoneNumber = phoneNumber; }
    public void setDateOfBirth(LocalDate dateOfBirth)     { this.dateOfBirth = dateOfBirth; }
    public void setGender(String gender)                  { this.gender = gender; }
    public void setAddress(String address)                { this.address = address; }
    public void setCurrentPassword(String currentPassword){ this.currentPassword = currentPassword; }
    public void setNewPassword(String newPassword)        { this.newPassword = newPassword; }
}
