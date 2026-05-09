package edu.cit.daclan.medicore.feature.auth.dto.request;

import jakarta.validation.constraints.*;

public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstname;

    @NotBlank(message = "Last name is required")
    private String lastname;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phoneNumber;

    @NotBlank(message = "Role is required")
    private String role;

    // ── NEW: sent by frontend after Google verification ──────────────────
    // true = user clicked "Continue with Google" and we confirmed the email
    // false (or missing) = email was NOT Google-verified — reject registration
    private boolean googleVerified = false;

    // PATIENT only
    private String dateOfBirth;
    private String gender;
    private String address;

    // DOCTOR only
    private String licenseNumber;
    private String specialization;

    // SECRETARY only
    private Long doctorId;

    public RegisterRequest() {}

    // Getters
    public String getFirstname()        { return firstname; }
    public String getLastname()         { return lastname; }
    public String getEmail()            { return email; }
    public String getPassword()         { return password; }
    public String getPhoneNumber()      { return phoneNumber; }
    public String getRole()             { return role; }
    public boolean isGoogleVerified()   { return googleVerified; }  // NEW
    public String getDateOfBirth()      { return dateOfBirth; }
    public String getGender()           { return gender; }
    public String getAddress()          { return address; }
    public String getLicenseNumber()    { return licenseNumber; }
    public String getSpecialization()   { return specialization; }
    public Long getDoctorId()           { return doctorId; }

    // Setters
    public void setFirstname(String v)       { this.firstname = v; }
    public void setLastname(String v)        { this.lastname = v; }
    public void setEmail(String v)           { this.email = v; }
    public void setPassword(String v)        { this.password = v; }
    public void setPhoneNumber(String v)     { this.phoneNumber = v; }
    public void setRole(String v)            { this.role = v; }
    public void setGoogleVerified(boolean v) { this.googleVerified = v; } // NEW
    public void setDateOfBirth(String v)     { this.dateOfBirth = v; }
    public void setGender(String v)          { this.gender = v; }
    public void setAddress(String v)         { this.address = v; }
    public void setLicenseNumber(String v)   { this.licenseNumber = v; }
    public void setSpecialization(String v)  { this.specialization = v; }
    public void setDoctorId(Long v)          { this.doctorId = v; }
}
