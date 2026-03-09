package edu.cit.daclan.medicore.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "patient_id")
    private UUID patientId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String address;

    public Patient() {}

    public UUID getPatientId() { return patientId; }
    public User getUser() { return user; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public String getAddress() { return address; }

    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public void setUser(User user) { this.user = user; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setGender(String gender) { this.gender = gender; }
    public void setAddress(String address) { this.address = address; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private LocalDate dateOfBirth;
        private String gender, address;

        public Builder user(User user) { this.user = user; return this; }
        public Builder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public Builder gender(String gender) { this.gender = gender; return this; }
        public Builder address(String address) { this.address = address; return this; }

        public Patient build() {
            Patient p = new Patient();
            p.user = this.user;
            p.dateOfBirth = this.dateOfBirth;
            p.gender = this.gender;
            p.address = this.address;
            return p;
        }
    }
}