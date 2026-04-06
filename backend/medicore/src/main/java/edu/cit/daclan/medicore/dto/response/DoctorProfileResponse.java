package edu.cit.daclan.medicore.dto;

public class DoctorProfileResponse {

    private Long   doctorId;
    private Long   userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String specialization;
    private String licenseNumber;
    private String profilePicture;
    private String status;
    private Integer yearsOfExperience;
    private String bio;

    public DoctorProfileResponse() {}

    // ── Getters ───────────────────────────────────────────────────────────
    public Long    getDoctorId()            { return doctorId; }
    public Long    getUserId()              { return userId; }
    public String  getFirstName()           { return firstName; }
    public String  getLastName()            { return lastName; }
    public String  getEmail()               { return email; }
    public String  getPhoneNumber()         { return phoneNumber; }
    public String  getSpecialization()      { return specialization; }
    public String  getLicenseNumber()       { return licenseNumber; }
    public String  getProfilePicture()      { return profilePicture; }
    public String  getStatus()              { return status; }
    public Integer getYearsOfExperience()   { return yearsOfExperience; }
    public String  getBio()                 { return bio; }

    // ── Setters ───────────────────────────────────────────────────────────
    public void setDoctorId(Long doctorId)                  { this.doctorId = doctorId; }
    public void setUserId(Long userId)                      { this.userId = userId; }
    public void setFirstName(String firstName)              { this.firstName = firstName; }
    public void setLastName(String lastName)                { this.lastName = lastName; }
    public void setEmail(String email)                      { this.email = email; }
    public void setPhoneNumber(String phoneNumber)          { this.phoneNumber = phoneNumber; }
    public void setSpecialization(String specialization)    { this.specialization = specialization; }
    public void setLicenseNumber(String licenseNumber)      { this.licenseNumber = licenseNumber; }
    public void setProfilePicture(String profilePicture)    { this.profilePicture = profilePicture; }
    public void setStatus(String status)                    { this.status = status; }
    public void setYearsOfExperience(Integer y)             { this.yearsOfExperience = y; }
    public void setBio(String bio)                          { this.bio = bio; }

    // ── Builder ───────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long doctorId, userId;
        private String firstName, lastName, email, phoneNumber;
        private String specialization, licenseNumber, profilePicture, status;
        private Integer yearsOfExperience;
        private String bio;

        public Builder doctorId(Long v)              { this.doctorId = v; return this; }
        public Builder userId(Long v)                { this.userId = v; return this; }
        public Builder firstName(String v)           { this.firstName = v; return this; }
        public Builder lastName(String v)            { this.lastName = v; return this; }
        public Builder email(String v)               { this.email = v; return this; }
        public Builder phoneNumber(String v)         { this.phoneNumber = v; return this; }
        public Builder specialization(String v)      { this.specialization = v; return this; }
        public Builder licenseNumber(String v)       { this.licenseNumber = v; return this; }
        public Builder profilePicture(String v)      { this.profilePicture = v; return this; }
        public Builder status(String v)              { this.status = v; return this; }
        public Builder yearsOfExperience(Integer v)  { this.yearsOfExperience = v; return this; }
        public Builder bio(String v)                 { this.bio = v; return this; }

        public DoctorProfileResponse build() {
            DoctorProfileResponse r = new DoctorProfileResponse();
            r.doctorId           = this.doctorId;
            r.userId             = this.userId;
            r.firstName          = this.firstName;
            r.lastName           = this.lastName;
            r.email              = this.email;
            r.phoneNumber        = this.phoneNumber;
            r.specialization     = this.specialization;
            r.licenseNumber      = this.licenseNumber;
            r.profilePicture     = this.profilePicture;
            r.status             = this.status;
            r.yearsOfExperience  = this.yearsOfExperience;
            r.bio                = this.bio;
            return r;
        }
    }
}