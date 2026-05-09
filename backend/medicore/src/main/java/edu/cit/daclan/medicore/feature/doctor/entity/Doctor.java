package edu.cit.daclan.medicore.feature.doctor.entity;
import edu.cit.daclan.medicore.feature.auth.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id")
    private Long doctorId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture;

    @Column(nullable = false)
    private String status = "PENDING";

    // ── NEW fields (added for profile editing) ─────────────────────────────
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public Doctor() {}

    // ── Getters ───────────────────────────────────────────────────────────
    public Long getDoctorId()              { return doctorId; }
    public User getUser()                  { return user; }
    public String getLicenseNumber()       { return licenseNumber; }
    public String getSpecialization()      { return specialization; }
    public String getProfilePicture()      { return profilePicture; }
    public String getStatus()              { return status; }
    public Integer getYearsOfExperience()  { return yearsOfExperience; }
    public String getBio()                 { return bio; }

    // ── Setters ───────────────────────────────────────────────────────────
    public void setDoctorId(Long doctorId)            { this.doctorId = doctorId; }
    public void setUser(User user)                    { this.user = user; }
    public void setLicenseNumber(String l)            { this.licenseNumber = l; }
    public void setSpecialization(String s)           { this.specialization = s; }
    public void setProfilePicture(String p)           { this.profilePicture = p; }
    public void setStatus(String status)              { this.status = status; }
    public void setYearsOfExperience(Integer y)       { this.yearsOfExperience = y; }
    public void setBio(String bio)                    { this.bio = bio; }

    // ── Builder ───────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private String licenseNumber, specialization, profilePicture, status = "PENDING";
        private Integer yearsOfExperience;
        private String bio;

        public Builder user(User u)                      { this.user = u; return this; }
        public Builder licenseNumber(String l)           { this.licenseNumber = l; return this; }
        public Builder specialization(String s)          { this.specialization = s; return this; }
        public Builder profilePicture(String p)          { this.profilePicture = p; return this; }
        public Builder status(String s)                  { this.status = s; return this; }
        public Builder yearsOfExperience(Integer y)      { this.yearsOfExperience = y; return this; }
        public Builder bio(String b)                     { this.bio = b; return this; }

        public Doctor build() {
            Doctor d = new Doctor();
            d.user              = this.user;
            d.licenseNumber     = this.licenseNumber;
            d.specialization    = this.specialization;
            d.profilePicture    = this.profilePicture;
            d.status            = this.status;
            d.yearsOfExperience = this.yearsOfExperience;
            d.bio               = this.bio;
            return d;
        }
    }
}


