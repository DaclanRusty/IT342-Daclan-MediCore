package edu.cit.daclan.medicore.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "secretaries")
public class Secretary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "secretary_id")
    private Long secretaryId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    // PENDING → doctor approves → APPROVED, or REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
        updatedAt   = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Secretary() {}

    // Getters
    public Long getSecretaryId()         { return secretaryId; }
    public User getUser()                { return user; }
    public Doctor getDoctor()            { return doctor; }
    public String getStatus()            { return status; }
    public LocalDateTime getRequestedAt(){ return requestedAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    // Setters
    public void setSecretaryId(Long secretaryId)   { this.secretaryId = secretaryId; }
    public void setUser(User user)                 { this.user = user; }
    public void setDoctor(Doctor doctor)           { this.doctor = doctor; }
    public void setStatus(String status)           { this.status = status; }
    public void setRequestedAt(LocalDateTime t)    { this.requestedAt = t; }
    public void setUpdatedAt(LocalDateTime t)      { this.updatedAt = t; }
}