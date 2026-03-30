package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.service.SecretaryApprovalService;
import edu.cit.daclan.medicore.service.SecretaryApprovalService.SecretarySummaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Doctor-facing endpoints for managing their secretaries.
 * The doctor is identified from the JWT token — no doctorId needed in the path.
 *
 * Endpoints match DoctorDashboard.jsx → doctorApi calls:
 *   GET  /api/v1/doctor/secretary-requests        → getSecretaryRequests()
 *   PUT  /api/v1/doctor/secretary-requests/{id}/approve  → approveSecretary(id)
 *   PUT  /api/v1/doctor/secretary-requests/{id}/reject   → rejectSecretary(id)
 */
@RestController
@RequestMapping("/api/v1/doctor/secretary-requests")
public class SecretaryController {

    private final SecretaryApprovalService secretaryApprovalService;

    public SecretaryController(SecretaryApprovalService secretaryApprovalService) {
        this.secretaryApprovalService = secretaryApprovalService;
    }

    // GET all secretary requests (all statuses) for the logged-in doctor
    @GetMapping
    public ResponseEntity<ApiResponse<List<SecretarySummaryResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success(secretaryApprovalService.getAllSecretaries()));
    }

    // PUT approve a secretary
    @PutMapping("/{secretaryId}/approve")
    public ResponseEntity<ApiResponse<SecretarySummaryResponse>> approve(
            @PathVariable Long secretaryId) {
        return ResponseEntity.ok(ApiResponse.success(
                secretaryApprovalService.updateSecretaryStatus(secretaryId, "APPROVED")));
    }

    // PUT reject a secretary
    @PutMapping("/{secretaryId}/reject")
    public ResponseEntity<ApiResponse<SecretarySummaryResponse>> reject(
            @PathVariable Long secretaryId) {
        return ResponseEntity.ok(ApiResponse.success(
                secretaryApprovalService.updateSecretaryStatus(secretaryId, "REJECTED")));
    }
}