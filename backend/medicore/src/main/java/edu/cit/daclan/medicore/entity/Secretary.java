package edu.cit.daclan.medicore.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "secretaries")
public class Secretary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "secretary_id")
    private UUID secretaryId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    public Secretary() {}

    public UUID getSecretaryId() { return secretaryId; }
    public User getUser() { return user; }
    public void setSecretaryId(UUID secretaryId) { this.secretaryId = secretaryId; }
    public void setUser(User user) { this.user = user; }
}