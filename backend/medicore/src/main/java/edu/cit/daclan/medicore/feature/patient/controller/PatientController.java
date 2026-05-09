package edu.cit.daclan.medicore.feature.patient.controller;

import edu.cit.daclan.medicore.feature.patient.dto.request.PatientProfileRequest;
import edu.cit.daclan.medicore.shared.dto.response.ApiResponse;
import edu.cit.daclan.medicore.feature.doctor.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.feature.patient.dto.response.PatientProfileResponse;
import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.auth.entity.User;
import edu.cit.daclan.medicore.feature.doctor.repository.DoctorRepository;
import edu.cit.daclan.medicore.feature.auth.repository.UserRepository;
import edu.cit.daclan.medicore.feature.patient.service.PatientService;
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
    private final UserRepository   userRepository;  // 👈 added

    public PatientController(DoctorRepository doctorRepository,
                             PatientService patientService,
                             UserRepository userRepository) {  // 👈 added
        this.doctorRepository = doctorRepository;
        this.patientService   = patientService;
        this.userRepository   = userRepository;  // 👈 added
    }

    // ── GET /api/v1/doctors ───────────────────────────────────────────────────
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

    // ── PUT /api/v1/patient/profile/picture ──────────────────────────────────
    @PutMapping("/patient/profile/picture")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePicture(body.get("profilePicture"));
        userRepository.save(user);
        return getProfile(userDetails);
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
        m.put("profilePicture",    d.getUser().getProfilePicture());  // ✅ from users table
        m.put("yearsOfExperience", d.getYearsOfExperience());
        m.put("bio",               d.getBio());
        m.put("status",            d.getStatus());
        return m;
    }
}
