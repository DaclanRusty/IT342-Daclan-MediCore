package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.service.DoctorApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/secretary")
public class SecretaryController {

    private final DoctorApprovalService doctorApprovalService;

    public SecretaryController(DoctorApprovalService doctorApprovalService) {
        this.doctorApprovalService = doctorApprovalService;
    }

    // GET all pending doctors
    @GetMapping("/doctors/pending")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getPendingDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorApprovalService.getPendingDoctors()));
    }

    // GET all doctors (all statuses)
    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorApprovalService.getAllDoctors()));
    }

    // PUT approve doctor
    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> approveDoctor(
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "APPROVED")));
    }

    // PUT reject doctor
    @PutMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> rejectDoctor(
            @PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "REJECTED")));
    }
}