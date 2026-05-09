package edu.cit.daclan.medicore.service;

import edu.cit.daclan.medicore.dto.request.PatientProfileRequest;
import edu.cit.daclan.medicore.dto.response.PatientProfileResponse;
import edu.cit.daclan.medicore.entity.Patient;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.PatientRepository;
import edu.cit.daclan.medicore.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;

    public PatientService(PatientRepository patientRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.userRepository    = userRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    // ── GET profile ───────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PatientProfileResponse getProfile(String email) {
        User    user    = findUserByEmail(email);
        Patient patient = findPatientByUser(user);
        return toResponse(user, patient);
    }

    // ── UPDATE profile ────────────────────────────────────────────────────────
    @Transactional
    public PatientProfileResponse updateProfile(String email, PatientProfileRequest req) {
        User    user    = findUserByEmail(email);
        Patient patient = findPatientByUser(user);

        if (isPresent(req.getFirstName()))   user.setFirstName(req.getFirstName().trim());
        if (isPresent(req.getLastName()))    user.setLastName(req.getLastName().trim());
        if (req.getPhoneNumber() != null)    user.setPhoneNumber(req.getPhoneNumber().trim());

        if (isPresent(req.getCurrentPassword()) && isPresent(req.getNewPassword())) {
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect.");
            }
            if (req.getNewPassword().length() < 8) {
                throw new IllegalArgumentException("New password must be at least 8 characters.");
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        if (req.getDateOfBirth() != null)   patient.setDateOfBirth(req.getDateOfBirth());
        if (isPresent(req.getGender()))     patient.setGender(req.getGender().trim());
        if (isPresent(req.getAddress()))    patient.setAddress(req.getAddress().trim());

        userRepository.save(user);
        patientRepository.save(patient);

        return toResponse(user, patient);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private Patient findPatientByUser(User user) {
        return patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + user.getEmail()));
    }

    private boolean isPresent(String s) {
        return s != null && !s.isBlank();
    }

    private PatientProfileResponse toResponse(User user, Patient patient) {
        return PatientProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .profilePicture(user.getProfilePicture())  // 👈 added
                .patientId(patient.getPatientId())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .build();
    }
}