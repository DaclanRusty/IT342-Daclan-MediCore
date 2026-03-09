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

    public Doctor() {}

    public UUID getDoctorId() { return doctorId; }
    public User getUser() { return user; }
    public String getLicenseNumber() { return licenseNumber; }
    public String getSpecialization() { return specialization; }
    public String getProfilePicture() { return profilePicture; }

    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }
    public void setUser(User user) { this.user = user; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private String licenseNumber, specialization, profilePicture;

        public Builder user(User user) { this.user = user; return this; }
        public Builder licenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; return this; }
        public Builder specialization(String specialization) { this.specialization = specialization; return this; }
        public Builder profilePicture(String profilePicture) { this.profilePicture = profilePicture; return this; }

        public Doctor build() {
            Doctor d = new Doctor();
            d.user = this.user;
            d.licenseNumber = this.licenseNumber;
            d.specialization = this.specialization;
            d.profilePicture = this.profilePicture;
            return d;
        }
    }
}