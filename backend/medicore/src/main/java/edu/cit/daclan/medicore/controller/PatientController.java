package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.request.PatientProfileRequest;
import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.dto.response.PatientProfileResponse;
import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.DoctorRepository;
import edu.cit.daclan.medicore.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class PatientController {

    private final DoctorRepository doctorRepository;
    private final PatientService   patientService;

    public PatientController(DoctorRepository doctorRepository,
                             PatientService patientService) {
        this.doctorRepository = doctorRepository;
        this.patientService   = patientService;
    }

    // ── GET /api/v1/doctors — all approved doctors ────────────────────────────
    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getApprovedDoctors() {
        List<DoctorSummaryResponse> doctors = doctorRepository
                .findAllByStatus("APPROVED")
                .stream()
                .filter(doc -> doc.getUser() != null)
                .map(doc -> {
                    User u = doc.getUser();
                    return DoctorSummaryResponse.builder()
                            .doctorId(doc.getDoctorId())
                            .firstName(u.getFirstName()         != null ? u.getFirstName()      : "")
                            .lastName(u.getLastName()           != null ? u.getLastName()        : "")
                            .email(u.getEmail()                 != null ? u.getEmail()           : "")
                            .phoneNumber(u.getPhoneNumber())
                            .specialization(doc.getSpecialization() != null ? doc.getSpecialization() : "")
                            .licenseNumber(doc.getLicenseNumber())
                            .profilePicture(doc.getProfilePicture())
                            .status(doc.getStatus()             != null ? doc.getStatus()        : "")
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    // ── GET /api/v1/doctors/with-secretary ────────────────────────────────────
    // Only approved doctors who have an APPROVED secretary assigned.
    // Patients use this endpoint for booking — guarantees every appointment
    // booked through here can be managed by a secretary.
    @GetMapping("/doctors/with-secretary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDoctorsWithSecretary() {
        List<Map<String, Object>> result = doctorRepository
                .findDoctorsWithApprovedSecretary()
                .stream()
                .map(this::doctorToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── GET /api/v1/patient/profile ───────────────────────────────────────────
    @GetMapping("/patient/profile")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        PatientProfileResponse profile =
                patientService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    // ── PUT /api/v1/patient/profile ───────────────────────────────────────────
    @PutMapping("/patient/profile")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PatientProfileRequest request) {

        PatientProfileResponse updated =
                patientService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    // ── Private helper ────────────────────────────────────────────────────────
    private Map<String, Object> doctorToMap(Doctor d) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("doctorId",          d.getDoctorId());
        m.put("firstName",         d.getUser().getFirstName());
        m.put("lastName",          d.getUser().getLastName());
        m.put("email",             d.getUser().getEmail());
        m.put("phoneNumber",       d.getUser().getPhoneNumber());
        m.put("specialization",    d.getSpecialization());
        m.put("licenseNumber",     d.getLicenseNumber());
        m.put("profilePicture",    d.getProfilePicture());
        m.put("yearsOfExperience", d.getYearsOfExperience());
        m.put("bio",               d.getBio());
        m.put("status",            d.getStatus());
        return m;
    }
}