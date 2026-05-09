package edu.cit.daclan.medicore.feature.auth.controller;

import edu.cit.daclan.medicore.feature.auth.dto.request.*;
import edu.cit.daclan.medicore.feature.auth.dto.response.AuthResponse;
import edu.cit.daclan.medicore.feature.doctor.dto.response.AvailableDoctorResponse;
import edu.cit.daclan.medicore.shared.dto.response.ApiResponse;
import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.doctor.repository.DoctorRepository;
import edu.cit.daclan.medicore.feature.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final DoctorRepository doctorRepository;

    public AuthController(AuthService authService, DoctorRepository doctorRepository) {
        this.authService      = authService;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody GoogleAuthRequest request) {
        AuthResponse data = authService.googleLogin(request.getCredential());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/google/verify")
    public ResponseEntity<ApiResponse<String>> verifyGoogleToken(
            @RequestBody GoogleAuthRequest request) {
        String email = authService.verifyGoogleToken(request.getCredential());
        return ResponseEntity.ok(ApiResponse.success(email));
    }

    @GetMapping("/doctors/available")
    public ResponseEntity<ApiResponse<List<AvailableDoctorResponse>>> getAvailableDoctors() {
        List<AvailableDoctorResponse> doctors = doctorRepository.findAvailableDoctors()
                .stream()
                .map(doc -> {
                    AvailableDoctorResponse r = new AvailableDoctorResponse();
                    r.setDoctorId(doc.getDoctorId());
                    r.setFirstname(doc.getUser().getFirstName());
                    r.setLastname(doc.getUser().getLastName());
                    r.setSpecialization(doc.getSpecialization());
                    r.setEmail(doc.getUser().getEmail());
                    return r;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(doctors));
    }
}
