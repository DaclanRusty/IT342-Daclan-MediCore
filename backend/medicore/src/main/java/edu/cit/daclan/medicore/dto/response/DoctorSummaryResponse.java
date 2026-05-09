package edu.cit.daclan.medicore.dto.response;

public class DoctorSummaryResponse {

    private Long    doctorId;
    private String  firstName;
    private String  lastName;
    private String  email;
    private String  phoneNumber;
    private String  specialization;
    private String  licenseNumber;
    private String  profilePicture;
    private String  status;
    private Integer yearsOfExperience;  // 👈 added
    private String  bio;                // 👈 added

    public DoctorSummaryResponse() {}

    // Getters
    public Long    getDoctorId()           { return doctorId; }
    public String  getFirstName()          { return firstName; }
    public String  getLastName()           { return lastName; }
    public String  getEmail()              { return email; }
    public String  getPhoneNumber()        { return phoneNumber; }
    public String  getSpecialization()     { return specialization; }
    public String  getLicenseNumber()      { return licenseNumber; }
    public String  getProfilePicture()     { return profilePicture; }
    public String  getStatus()             { return status; }
    public Integer getYearsOfExperience()  { return yearsOfExperience; }  // 👈 added
    public String  getBio()                { return bio; }                 // 👈 added

    // Setters
    public void setDoctorId(Long id)                    { this.doctorId = id; }
    public void setFirstName(String f)                  { this.firstName = f; }
    public void setLastName(String l)                   { this.lastName = l; }
    public void setEmail(String e)                      { this.email = e; }
    public void setPhoneNumber(String p)                { this.phoneNumber = p; }
    public void setSpecialization(String s)             { this.specialization = s; }
    public void setLicenseNumber(String l)              { this.licenseNumber = l; }
    public void setProfilePicture(String p)             { this.profilePicture = p; }
    public void setStatus(String s)                     { this.status = s; }
    public void setYearsOfExperience(Integer y)         { this.yearsOfExperience = y; }  // 👈 added
    public void setBio(String b)                        { this.bio = b; }                 // 👈 added

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long    doctorId;
        private String  firstName, lastName, email, phoneNumber;
        private String  specialization, licenseNumber, profilePicture, status;
        private Integer yearsOfExperience;  // 👈 added
        private String  bio;                // 👈 added

        public Builder doctorId(Long id)                { this.doctorId = id; return this; }
        public Builder firstName(String f)              { this.firstName = f; return this; }
        public Builder lastName(String l)               { this.lastName = l; return this; }
        public Builder email(String e)                  { this.email = e; return this; }
        public Builder phoneNumber(String p)            { this.phoneNumber = p; return this; }
        public Builder specialization(String s)         { this.specialization = s; return this; }
        public Builder licenseNumber(String l)          { this.licenseNumber = l; return this; }
        public Builder profilePicture(String p)         { this.profilePicture = p; return this; }
        public Builder status(String s)                 { this.status = s; return this; }
        public Builder yearsOfExperience(Integer y)     { this.yearsOfExperience = y; return this; }
        public Builder bio(String b)                    { this.bio = b; return this; }

        public DoctorSummaryResponse build() {
            DoctorSummaryResponse r = new DoctorSummaryResponse();
            r.doctorId          = this.doctorId;
            r.firstName         = this.firstName;
            r.lastName          = this.lastName;
            r.email             = this.email;
            r.phoneNumber       = this.phoneNumber;
            r.specialization    = this.specialization;
            r.licenseNumber     = this.licenseNumber;
            r.profilePicture    = this.profilePicture;
            r.status            = this.status;
            r.yearsOfExperience = this.yearsOfExperience;
            r.bio               = this.bio;
            return r;
        }
    }
}