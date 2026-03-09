package edu.cit.daclan.medicore.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "doctor_id")
    private UUID doctorId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(nullable = false)
    private String status = "PENDING";

    public Doctor() {}

    public UUID getDoctorId()         { return doctorId; }
    public User getUser()             { return user; }
    public String getLicenseNumber()  { return licenseNumber; }
    public String getSpecialization() { return specialization; }
    public String getProfilePicture() { return profilePicture; }
    public String getStatus()         { return status; }  // ← ADD THIS

    public void setDoctorId(UUID doctorId)           { this.doctorId = doctorId; }
    public void setUser(User user)                   { this.user = user; }
    public void setLicenseNumber(String l)           { this.licenseNumber = l; }
    public void setSpecialization(String s)          { this.specialization = s; }
    public void setProfilePicture(String p)          { this.profilePicture = p; }
    public void setStatus(String status)             { this.status = status; }  // ← ADD THIS

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private String licenseNumber, specialization, profilePicture, status = "PENDING";

        public Builder user(User u)                  { this.user = u; return this; }
        public Builder licenseNumber(String l)       { this.licenseNumber = l; return this; }
        public Builder specialization(String s)      { this.specialization = s; return this; }
        public Builder profilePicture(String p)      { this.profilePicture = p; return this; }
        public Builder status(String s)              { this.status = s; return this; }  // ← ADD THIS

        public Doctor build() {
            Doctor d = new Doctor();
            d.user          = this.user;
            d.licenseNumber = this.licenseNumber;
            d.specialization= this.specialization;
            d.profilePicture= this.profilePicture;
            d.status        = this.status;
            return d;
        }
    }
}