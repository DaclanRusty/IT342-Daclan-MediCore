package edu.cit.daclan.medicore.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long id;

    // ── Changed: was User, now Patient (matches appointments_patient_id_fkey → patients) ──
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "requested_date", nullable = false)
    private String requestedDate;

    @Column(name = "requested_time", nullable = false)
    private String requestedTime;

    @Column(name = "reason_for_visit", nullable = false, length = 500)
    private String reasonForVisit;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Appointment() {}

    // Getters
    public Long getId()                  { return id; }
    public Patient getPatient()          { return patient; }
    public Doctor getDoctor()            { return doctor; }
    public String getRequestedDate()     { return requestedDate; }
    public String getRequestedTime()     { return requestedTime; }
    public String getReasonForVisit()    { return reasonForVisit; }
    public String getStatus()            { return status; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    // Setters
    public void setId(Long id)                       { this.id = id; }
    public void setPatient(Patient patient)          { this.patient = patient; }
    public void setDoctor(Doctor doctor)             { this.doctor = doctor; }
    public void setRequestedDate(String d)           { this.requestedDate = d; }
    public void setRequestedTime(String t)           { this.requestedTime = t; }
    public void setReasonForVisit(String r)          { this.reasonForVisit = r; }
    public void setStatus(String status)             { this.status = status; }
    public void setCreatedAt(LocalDateTime t)        { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)        { this.updatedAt = t; }
}