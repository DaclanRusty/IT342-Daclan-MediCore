package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.request.*;
import edu.cit.daclan.medicore.dto.response.*;
import edu.cit.daclan.medicore.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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

    // ── Google Sign-In: patient logs in with Google token ─────────────────
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody GoogleAuthRequest request) {
        AuthResponse data = authService.googleLogin(request.getCredential());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Verify Google token during registration (returns email) ───────────
    @PostMapping("/google/verify")
    public ResponseEntity<ApiResponse<String>> verifyGoogleToken(
            @RequestBody GoogleAuthRequest request) {
        String email = authService.verifyGoogleToken(request.getCredential());
        return ResponseEntity.ok(ApiResponse.success(email));
    }
}