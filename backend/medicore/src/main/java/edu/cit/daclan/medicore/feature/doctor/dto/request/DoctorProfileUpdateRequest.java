package edu.cit.daclan.medicore.dto;

public class DoctorProfileUpdateRequest {

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String specialization;
    private Integer yearsOfExperience;
    private String bio;

    // ── password change (optional — only applied if newPassword is provided) ──
    private String currentPassword;
    private String newPassword;

    public DoctorProfileUpdateRequest() {}

    // ── Getters ───────────────────────────────────────────────────────────
    public String  getFirstName()           { return firstName; }
    public String  getLastName()            { return lastName; }
    public String  getPhoneNumber()         { return phoneNumber; }
    public String  getSpecialization()      { return specialization; }
    public Integer getYearsOfExperience()   { return yearsOfExperience; }
    public String  getBio()                 { return bio; }
    public String  getCurrentPassword()     { return currentPassword; }
    public String  getNewPassword()         { return newPassword; }

    // ── Setters ───────────────────────────────────────────────────────────
    public void setFirstName(String v)            { this.firstName = v; }
    public void setLastName(String v)             { this.lastName = v; }
    public void setPhoneNumber(String v)          { this.phoneNumber = v; }
    public void setSpecialization(String v)       { this.specialization = v; }
    public void setYearsOfExperience(Integer v)   { this.yearsOfExperience = v; }
    public void setBio(String v)                  { this.bio = v; }
    public void setCurrentPassword(String v)      { this.currentPassword = v; }
    public void setNewPassword(String v)          { this.newPassword = v; }
}
