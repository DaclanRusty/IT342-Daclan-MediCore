package edu.cit.daclan.medicore.dto.request;

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

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Date of birth is required")
    private String dateOfBirth;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Role is required")
    private String role;

    private String licenseNumber;
    private String specialization;

    public RegisterRequest() {}

    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public String getAddress() { return address; }
    public String getRole() { return role; }
    public String getLicenseNumber() { return licenseNumber; }
    public String getSpecialization() { return specialization; }

    public void setFirstname(String firstname) { this.firstname = firstname; }
    public void setLastname(String lastname) { this.lastname = lastname; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setGender(String gender) { this.gender = gender; }
    public void setAddress(String address) { this.address = address; }
    public void setRole(String role) { this.role = role; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
}