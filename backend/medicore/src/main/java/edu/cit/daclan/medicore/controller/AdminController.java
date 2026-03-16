package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.SecretaryRepository;
import edu.cit.daclan.medicore.repository.UserRepository;
import edu.cit.daclan.medicore.service.DoctorApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final DoctorApprovalService doctorApprovalService;
    private final SecretaryRepository   secretaryRepository;
    private final UserRepository        userRepository;

    public AdminController(DoctorApprovalService doctorApprovalService,
                           SecretaryRepository secretaryRepository,
                           UserRepository userRepository) {
        this.doctorApprovalService = doctorApprovalService;
        this.secretaryRepository   = secretaryRepository;
        this.userRepository        = userRepository;
    }

    // ── Users ─────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(this::toUserMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long userId) {
        userRepository.findById(userId).ifPresent(userRepository::delete);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(body.get("role").toUpperCase());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    // ── NEW: Block / Unblock a user ───────────────────────────────────────
    // PUT /api/v1/admin/users/{userId}/block   → sets status = BLOCKED
    // PUT /api/v1/admin/users/{userId}/unblock → sets status = ACTIVE
    @PutMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<Map<String, Object>>> blockUser(
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("BLOCKED");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unblockUser(
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    // ── Helper: map User → plain Map (reads real status from DB) ─────────
    private Map<String, Object> toUserMap(User u) {
        // Use real status from the entity, never hardcode "ACTIVE"
        String status = u.getStatus() != null ? u.getStatus() : "ACTIVE";
        return Map.of(
                "userId",      u.getUserId(),
                "firstName",   u.getFirstName() != null ? u.getFirstName() : "",
                "lastName",    u.getLastName()  != null ? u.getLastName()  : "",
                "email",       u.getEmail(),
                "role",        u.getRole()      != null ? u.getRole()      : "",
                "phoneNumber", u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                "status",      status
        );
    }

    // ── Doctors ───────────────────────────────────────────────────────────

    @GetMapping("/doctors/pending")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getPendingDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorApprovalService.getPendingDoctors()));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorApprovalService.getAllDoctors()));
    }

    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> approveDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "APPROVED")));
    }

    @PutMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> rejectDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "REJECTED")));
    }

    // ── Secretary Assignments ─────────────────────────────────────────────

    @GetMapping("/secretary-assignments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSecretaryAssignments() {
        List<Map<String, Object>> assignments = secretaryRepository.findAll()
                .stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .map(s -> {
                    var docUser = s.getDoctor().getUser();
                    var secUser = s.getUser();
                    return Map.<String, Object>of(
                            "secretaryId",    s.getSecretaryId(),
                            "secretaryName",  secUser.getFirstName() + " " + secUser.getLastName(),
                            "secretaryEmail", secUser.getEmail(),
                            "doctorId",       s.getDoctor().getDoctorId(),
                            "doctorName",     "Dr. " + docUser.getFirstName() + " " + docUser.getLastName(),
                            "doctorEmail",    docUser.getEmail(),
                            "specialization", s.getDoctor().getSpecialization(),
                            "assignedSince",  s.getRequestedAt() != null ? s.getRequestedAt().toString() : ""
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(assignments));
    }
}