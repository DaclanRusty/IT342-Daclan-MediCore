package edu.cit.daclan.medicore.feature.secretary.service;

import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.secretary.entity.Secretary;
import edu.cit.daclan.medicore.feature.auth.entity.User;
import edu.cit.daclan.medicore.feature.doctor.repository.DoctorRepository;
import edu.cit.daclan.medicore.feature.secretary.repository.SecretaryRepository;
import edu.cit.daclan.medicore.feature.auth.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecretaryApprovalService {

    private final SecretaryRepository secretaryRepository;
    private final DoctorRepository    doctorRepository;
    private final UserRepository      userRepository;

    public SecretaryApprovalService(SecretaryRepository secretaryRepository,
                                    DoctorRepository doctorRepository,
                                    UserRepository userRepository) {
        this.secretaryRepository = secretaryRepository;
        this.doctorRepository    = doctorRepository;
        this.userRepository      = userRepository;
    }

    // ── Get the logged-in doctor from JWT ─────────────────────────────────
    private Doctor getLoggedInDoctor() {
        // The email/username is stored as the principal in the JWT filter
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName(); // returns the email set by JwtAuthFilter

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Logged-in user not found"));

        return doctorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("No doctor profile found for this user"));
    }

    // ── Get ALL secretary requests for the logged-in doctor ───────────────
    // FIX: was returning ALL secretaries globally; now scoped to the JWT doctor
    public List<SecretarySummaryResponse> getAllSecretaries() {
        Doctor doctor = getLoggedInDoctor();
        return secretaryRepository.findByDoctor(doctor)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    // ── Approve or Reject a secretary ─────────────────────────────────────
    // FIX: verifies the secretary actually belongs to the logged-in doctor
    //      before allowing the status change
    @Transactional
    public SecretarySummaryResponse updateSecretaryStatus(Long secretaryId, String newStatus) {
        String upper = newStatus.toUpperCase();
        if (!upper.equals("APPROVED") && !upper.equals("REJECTED"))
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");

        Doctor doctor = getLoggedInDoctor();

        Secretary secretary = secretaryRepository.findById(secretaryId)
                .orElseThrow(() -> new IllegalArgumentException("Secretary not found"));

        // Security: make sure this secretary actually requested THIS doctor
        if (!secretary.getDoctor().getDoctorId().equals(doctor.getDoctorId()))
            throw new IllegalStateException("You can only manage secretaries assigned to you");

        // If approving: reject all other pending/approved secretaries first
        // (a doctor can only have one secretary at a time)
        if ("APPROVED".equals(upper)) {
            secretaryRepository.findByDoctor(doctor)
                    .stream()
                    .filter(s -> !s.getSecretaryId().equals(secretaryId))
                    .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                    .forEach(s -> {
                        s.setStatus("REJECTED");
                        secretaryRepository.save(s);
                    });
        }

        secretary.setStatus(upper);
        secretaryRepository.save(secretary);
        return toSummary(secretary);
    }

    // ── DTO ───────────────────────────────────────────────────────────────
    private SecretarySummaryResponse toSummary(Secretary s) {
        SecretarySummaryResponse r = new SecretarySummaryResponse();
        r.setSecretaryId(s.getSecretaryId());
        r.setFirstname(s.getUser().getFirstName());
        r.setLastname(s.getUser().getLastName());
        r.setEmail(s.getUser().getEmail());
        r.setPhoneNumber(s.getUser().getPhoneNumber());
        r.setStatus(s.getStatus());
        r.setRequestedAt(s.getRequestedAt() != null ? s.getRequestedAt().toString() : null);
        return r;
    }

    // ── Inner DTO class ───────────────────────────────────────────────────
    public static class SecretarySummaryResponse {
        private Long   secretaryId;
        private String firstname;
        private String lastname;
        private String email;
        private String phoneNumber;
        private String status;
        private String requestedAt;

        public Long   getSecretaryId()  { return secretaryId; }
        public String getFirstname()    { return firstname; }
        public String getLastname()     { return lastname; }
        public String getEmail()        { return email; }
        public String getPhoneNumber()  { return phoneNumber; }
        public String getStatus()       { return status; }
        public String getRequestedAt()  { return requestedAt; }

        public void setSecretaryId(Long secretaryId)   { this.secretaryId = secretaryId; }
        public void setFirstname(String firstname)     { this.firstname = firstname; }
        public void setLastname(String lastname)       { this.lastname = lastname; }
        public void setEmail(String email)             { this.email = email; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public void setStatus(String status)           { this.status = status; }
        public void setRequestedAt(String requestedAt) { this.requestedAt = requestedAt; }
    }
}
