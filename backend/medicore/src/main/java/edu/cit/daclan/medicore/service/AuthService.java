package edu.cit.daclan.medicore.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import edu.cit.daclan.medicore.dto.request.*;
import edu.cit.daclan.medicore.dto.response.*;
import edu.cit.daclan.medicore.entity.*;
import edu.cit.daclan.medicore.repository.*;
import edu.cit.daclan.medicore.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Collections;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository        = userRepository;
        this.patientRepository     = patientRepository;
        this.doctorRepository      = doctorRepository;
        this.passwordEncoder       = passwordEncoder;
        this.jwtUtil               = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService          = emailService;
    }

    // ── Verify Google ID token and return the email ────────────────────────
    public String verifyGoogleToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            return payload.getEmail(); // verified Google email

        } catch (Exception e) {
            throw new IllegalArgumentException("Google token verification failed: " + e.getMessage());
        }
    }

    // ── Google Sign-In: login existing patient via Google token ───────────
    @Transactional
    public AuthResponse googleLogin(String credential) {
        String googleEmail = verifyGoogleToken(credential);

        // Check if user exists
        User user = userRepository.findByEmail(googleEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found for this Google email. Please register first."));

        // Only allow patients to use Google login
        if (!"PATIENT".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Google login is only available for patients.");
        }

        String accessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken, null);
    }

    // ── Register ───────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Common validations
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Role-specific validations
        if ("PATIENT".equalsIgnoreCase(request.getRole())) {
            if (request.getDateOfBirth() == null || request.getDateOfBirth().isBlank())
                throw new IllegalArgumentException("Date of birth is required");
            if (request.getGender() == null || request.getGender().isBlank())
                throw new IllegalArgumentException("Gender is required");
            if (request.getAddress() == null || request.getAddress().isBlank())
                throw new IllegalArgumentException("Address is required");
        }

        if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank())
                throw new IllegalArgumentException("License number is required for doctors");
            if (request.getSpecialization() == null || request.getSpecialization().isBlank())
                throw new IllegalArgumentException("Specialization is required for doctors");
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber()))
                throw new IllegalArgumentException("License number is already registered");
        }

        // Save User
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole().toUpperCase())
                .build();
        userRepository.save(user);

        // Save role-specific record
        if ("PATIENT".equalsIgnoreCase(request.getRole())) {
            Patient patient = Patient.builder()
                    .user(user)
                    .dateOfBirth(LocalDate.parse(request.getDateOfBirth()))
                    .gender(request.getGender().toUpperCase())
                    .address(request.getAddress())
                    .build();
            patientRepository.save(patient);

            // ── Send welcome email ─────────────────────────────────────────
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

            String accessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
            return buildAuthResponse(user, accessToken, refreshToken, null);

        } else if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .licenseNumber(request.getLicenseNumber())
                    .specialization(request.getSpecialization())
                    .status("PENDING")
                    .build();
            doctorRepository.save(doctor);

            return buildAuthResponse(user, null, null,
                    "Registration submitted. Please wait for secretary approval.");
        }

        throw new IllegalArgumentException("Invalid role: " + request.getRole());
    }

    // ── Login ──────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        // Block doctors who are not yet approved
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new BadCredentialsException("Doctor record not found"));

            if ("PENDING".equalsIgnoreCase(doctor.getStatus())) {
                throw new IllegalStateException(
                        "Your account is pending approval by the secretary.");
            }
            if ("REJECTED".equalsIgnoreCase(doctor.getStatus())) {
                throw new IllegalStateException(
                        "Your registration was rejected. Please contact support.");
            }
        }

        String accessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken, null);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken,
                                           String refreshToken, String message) {
        return AuthResponse.builder()
                .user(AuthResponse.UserInfo.builder()
                        .email(user.getEmail())
                        .firstname(user.getFirstName())
                        .lastname(user.getLastName())
                        .role(user.getRole())
                        .build())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .message(message)
                .build();
    }
}