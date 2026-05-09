package edu.cit.daclan.medicore.feature.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }

    public User() {}

    public User(Long userId, String email, String password, String firstName,
                String lastName, String phoneNumber, String role, LocalDateTime createdAt) {
        this.userId      = userId;
        this.email       = email;
        this.password    = password;
        this.firstName   = firstName;
        this.lastName    = lastName;
        this.phoneNumber = phoneNumber;
        this.role        = role;
        this.createdAt   = createdAt;
        this.status      = "ACTIVE";
    }

    // Getters
    public Long getUserId()             { return userId; }
    public String getEmail()            { return email; }
    public String getPassword()         { return password; }
    public String getFirstName()        { return firstName; }
    public String getLastName()         { return lastName; }
    public String getPhoneNumber()      { return phoneNumber; }
    public String getRole()             { return role; }
    public String getStatus()           { return status != null ? status : "ACTIVE"; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getProfilePicture()   { return profilePicture; }

    // Setters
    public void setUserId(Long userId)                       { this.userId = userId; }
    public void setEmail(String email)                       { this.email = email; }
    public void setPassword(String password)                 { this.password = password; }
    public void setFirstName(String firstName)               { this.firstName = firstName; }
    public void setLastName(String lastName)                 { this.lastName = lastName; }
    public void setPhoneNumber(String phoneNumber)           { this.phoneNumber = phoneNumber; }
    public void setRole(String role)                         { this.role = role; }
    public void setStatus(String status)                     { this.status = status; }
    public void setCreatedAt(LocalDateTime c)                { this.createdAt = c; }
    public void setProfilePicture(String profilePicture)     { this.profilePicture = profilePicture; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId;
        private String email, password, firstName, lastName, phoneNumber, role;
        private String status = "ACTIVE";

        public Builder userId(Long userId)             { this.userId = userId; return this; }
        public Builder email(String email)             { this.email = email; return this; }
        public Builder password(String password)       { this.password = password; return this; }
        public Builder firstName(String firstName)     { this.firstName = firstName; return this; }
        public Builder lastName(String lastName)       { this.lastName = lastName; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder role(String role)               { this.role = role; return this; }
        public Builder status(String status)           { this.status = status; return this; }

        public User build() {
            User u = new User();
            u.userId        = this.userId;
            u.email         = this.email;
            u.password      = this.password;
            u.firstName     = this.firstName;
            u.lastName      = this.lastName;
            u.phoneNumber   = this.phoneNumber;
            u.role          = this.role;
            u.status        = this.status != null ? this.status : "ACTIVE";
            return u;
        }
    }
}
