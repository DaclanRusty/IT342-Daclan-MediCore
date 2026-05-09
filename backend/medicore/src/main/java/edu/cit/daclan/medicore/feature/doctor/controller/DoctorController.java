package edu.cit.daclan.medicore.feature.doctor.controller;

import edu.cit.daclan.medicore.dto.DoctorProfileResponse;
import edu.cit.daclan.medicore.dto.DoctorProfileUpdateRequest;
import edu.cit.daclan.medicore.shared.dto.response.ApiResponse;
import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.secretary.entity.Secretary;
import edu.cit.daclan.medicore.feature.auth.entity.User;
import edu.cit.daclan.medicore.feature.doctor.repository.DoctorRepository;
import edu.cit.daclan.medicore.feature.secretary.repository.SecretaryRepository;
import edu.cit.daclan.medicore.feature.auth.repository.UserRepository;
import edu.cit.daclan.medicore.feature.doctor.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/doctor")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService       doctorService;
    private final DoctorRepository    doctorRepository;
    private final UserRepository      userRepository;
    private final SecretaryRepository secretaryRepository;

    public DoctorController(DoctorService doctorService,
                            DoctorRepository doctorRepository,
                            UserRepository userRepository,
                            SecretaryRepository secretaryRepository) {
        this.doctorService       = doctorService;
        this.doctorRepository    = doctorRepository;
        this.userRepository      = userRepository;
        this.secretaryRepository = secretaryRepository;
    }

    // ── GET /api/v1/doctor/profile ────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            DoctorProfileResponse profile = doctorService.getMyProfile(userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── PUT /api/v1/doctor/profile ────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DoctorProfileUpdateRequest request) {
        try {
            DoctorProfileResponse updated = doctorService.updateMyProfile(
                    userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── PUT /api/v1/doctor/profile/picture ───────────────────────────────
    @PutMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        try {
            DoctorProfileResponse updated = doctorService.updateProfilePicture(
                    userDetails.getUsername(), body.get("profilePicture"));
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── GET /api/v1/doctor/secretary-requests ────────────────────────────
    @GetMapping("/secretary-requests")
    public ResponseEntity<?> getSecretaryRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            List<Secretary> secretaries = secretaryRepository.findByDoctor(doctor);

            List<Map<String, Object>> result = secretaries.stream().map(sec -> {
                User secUser = sec.getUser();
                return Map.<String, Object>of(
                        "secretaryId",    sec.getSecretaryId(),
                        "firstName",      secUser.getFirstName(),
                        "lastName",       secUser.getLastName(),
                        "email",          secUser.getEmail(),
                        "phoneNumber",    secUser.getPhoneNumber() != null ? secUser.getPhoneNumber() : "",
                        "status",         sec.getStatus(),
                        "requestedAt",    sec.getRequestedAt() != null ? sec.getRequestedAt().toString() : "",
                        "profilePicture", secUser.getProfilePicture() != null ? secUser.getProfilePicture() : ""
                );
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── PUT /api/v1/doctor/secretary-requests/{id}/approve ───────────────
    @PutMapping("/secretary-requests/{secretaryId}/approve")
    public ResponseEntity<?> approveSecretary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long secretaryId) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            boolean alreadyHasSecretary = secretaryRepository
                    .findByDoctor(doctor).stream()
                    .anyMatch(s -> "APPROVED".equals(s.getStatus()));
            if (alreadyHasSecretary)
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("You already have an assigned secretary."));

            Secretary secretary = secretaryRepository.findById(secretaryId)
                    .orElseThrow(() -> new RuntimeException("Secretary request not found"));
            if (!secretary.getDoctor().getDoctorId().equals(doctor.getDoctorId()))
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Not authorized to approve this request."));

            secretary.setStatus("APPROVED");
            secretaryRepository.save(secretary);
            return ResponseEntity.ok(ApiResponse.success("Secretary approved successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── PUT /api/v1/doctor/secretary-requests/{id}/reject ────────────────
    @PutMapping("/secretary-requests/{secretaryId}/reject")
    public ResponseEntity<?> rejectSecretary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long secretaryId) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            Secretary secretary = secretaryRepository.findById(secretaryId)
                    .orElseThrow(() -> new RuntimeException("Secretary request not found"));
            if (!secretary.getDoctor().getDoctorId().equals(doctor.getDoctorId()))
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Not authorized to reject this request."));

            secretary.setStatus("REJECTED");
            secretaryRepository.save(secretary);
            return ResponseEntity.ok(ApiResponse.success("Secretary request rejected."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
