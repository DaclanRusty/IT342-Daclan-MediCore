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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    // ── Completion fields ──────────────────────────────────────────────
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "doctor_notes", length = 1000)
    private String doctorNotes;

    // ── Cancellation fields ────────────────────────────────────────────
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    // ── Rejection fields ───────────────────────────────────────────────
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejected_reason", length = 500)
    private String rejectedReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = AppointmentStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Appointment() {}

    // Getters
    public Long getId()                     { return id; }
    public Patient getPatient()             { return patient; }
    public Doctor getDoctor()               { return doctor; }
    public String getRequestedDate()        { return requestedDate; }
    public String getRequestedTime()        { return requestedTime; }
    public String getReasonForVisit()       { return reasonForVisit; }
    public AppointmentStatus getStatus()    { return status; }
    public LocalDateTime getCompletedAt()   { return completedAt; }
    public String getDoctorNotes()          { return doctorNotes; }
    public LocalDateTime getCancelledAt()   { return cancelledAt; }
    public String getCancelReason()         { return cancelReason; }
    public LocalDateTime getRejectedAt()    { return rejectedAt; }
    public String getRejectedReason()       { return rejectedReason; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
    public LocalDateTime getUpdatedAt()     { return updatedAt; }

    // Setters
    public void setId(Long id)                          { this.id = id; }
    public void setPatient(Patient patient)             { this.patient = patient; }
    public void setDoctor(Doctor doctor)                { this.doctor = doctor; }
    public void setRequestedDate(String d)              { this.requestedDate = d; }
    public void setRequestedTime(String t)              { this.requestedTime = t; }
    public void setReasonForVisit(String r)             { this.reasonForVisit = r; }
    public void setStatus(AppointmentStatus status)     { this.status = status; }
    public void setCompletedAt(LocalDateTime t)         { this.completedAt = t; }
    public void setDoctorNotes(String n)                { this.doctorNotes = n; }
    public void setCancelledAt(LocalDateTime t)         { this.cancelledAt = t; }
    public void setCancelReason(String r)               { this.cancelReason = r; }
    public void setRejectedAt(LocalDateTime t)          { this.rejectedAt = t; }
    public void setRejectedReason(String r)             { this.rejectedReason = r; }
    public void setCreatedAt(LocalDateTime t)           { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)           { this.updatedAt = t; }
}