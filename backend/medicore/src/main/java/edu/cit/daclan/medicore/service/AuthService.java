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
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Collections;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SecretaryRepository secretaryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       SecretaryRepository secretaryRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       EmailService emailService) {
        this.userRepository      = userRepository;
        this.patientRepository   = patientRepository;
        this.doctorRepository    = doctorRepository;
        this.secretaryRepository = secretaryRepository;
        this.passwordEncoder     = passwordEncoder;
        this.jwtUtil             = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService        = emailService;
    }

    // ── OAuth2 redirect login (Google button on LoginPage) ────────────────
    @Transactional
    public String authenticateWithGoogleOAuth2User(OAuth2User oAuth2User) {

        String email = toStringValue(oAuth2User.getAttribute("email"));
        if (email == null || email.isBlank())
            throw new IllegalArgumentException("Google account email is unavailable.");

        email = email.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No MediCore account found for this Google email. " +
                                "Please register first."));

        if ("ADMIN".equalsIgnoreCase(user.getRole()))
            throw new IllegalArgumentException(
                    "Admin accounts cannot use Google sign-in. " +
                            "Please use your email and password.");

        if ("BLOCKED".equalsIgnoreCase(user.getStatus()))
            throw new IllegalArgumentException(
                    "Your account has been suspended. " +
                            "Please contact the administrator.");

        checkPendingRejected(user);

        // ── Use enriched token so AuthCallbackPage gets firstname/lastname ─
        return jwtUtil.generateAccessToken(
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    private String toStringValue(Object value) {
        return value != null ? value.toString() : "";
    }

    // ── Verify Google ID token (used during registration) ─────────────────
    public String verifyGoogleToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null)
                throw new IllegalArgumentException("Invalid Google token");
            return idToken.getPayload().getEmail();
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Google token verification failed: " + e.getMessage());
        }
    }

    // ── Google Sign-In via ID token (alternative flow) ────────────────────
    @Transactional
    public AuthResponse googleLogin(String credential) {
        String googleEmail = verifyGoogleToken(credential);

        User user = userRepository.findByEmail(googleEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found for this Google email. Please register first."));

        if ("ADMIN".equalsIgnoreCase(user.getRole()))
            throw new IllegalArgumentException(
                    "Admin accounts cannot use Google sign-in. " +
                            "Please use your email and password.");

        if ("BLOCKED".equalsIgnoreCase(user.getStatus()))
            throw new IllegalStateException(
                    "Your account has been suspended by the MediCore administrator.");

        checkPendingRejected(user);

        String accessToken  = jwtUtil.generateAccessToken(
                user.getEmail(), user.getRole(),
                user.getFirstName(), user.getLastName());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken, null);
    }

    // ── Register ──────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // ── Google verification check (all non-admin roles) ───────────────
        // Admin accounts are created manually — no Google verify needed.
        if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            if (!request.isGoogleVerified()) {
                throw new IllegalArgumentException(
                        "Email must be verified with Google before registering. " +
                                "Please click the 'Continue with Google' button first.");
            }
        }

        if (userRepository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("Email is already registered");

        // ── Role-specific validations ─────────────────────────────────────
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
                throw new IllegalArgumentException("License number is required");
            if (request.getSpecialization() == null || request.getSpecialization().isBlank())
                throw new IllegalArgumentException("Specialization is required");
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber()))
                throw new IllegalArgumentException("License number is already registered");
        }

        if ("SECRETARY".equalsIgnoreCase(request.getRole())) {
            if (request.getDoctorId() == null)
                throw new IllegalArgumentException(
                        "Please select a doctor to register under");
        }

        // ── Save base User ────────────────────────────────────────────────
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole().toUpperCase())
                .status("ACTIVE")
                .build();
        userRepository.save(user);

        // ── PATIENT ───────────────────────────────────────────────────────
        if ("PATIENT".equalsIgnoreCase(request.getRole())) {
            Patient patient = Patient.builder()
                    .user(user)
                    .dateOfBirth(LocalDate.parse(request.getDateOfBirth()))
                    .gender(request.getGender().toUpperCase())
                    .address(request.getAddress())
                    .build();
            patientRepository.save(patient);
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

            String accessToken  = jwtUtil.generateAccessToken(
                    user.getEmail(), user.getRole(),
                    user.getFirstName(), user.getLastName());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
            return buildAuthResponse(user, accessToken, refreshToken, null);
        }

        // ── DOCTOR ────────────────────────────────────────────────────────
        if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .licenseNumber(request.getLicenseNumber())
                    .specialization(request.getSpecialization())
                    .status("PENDING")
                    .build();
            doctorRepository.save(doctor);
            return buildAuthResponse(user, null, null,
                    "Registration submitted. Please wait for admin approval.");
        }

        // ── SECRETARY ─────────────────────────────────────────────────────
        if ("SECRETARY".equalsIgnoreCase(request.getRole())) {
            Doctor assignedDoctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Selected doctor not found"));

            if (!"APPROVED".equalsIgnoreCase(assignedDoctor.getStatus()))
                throw new IllegalArgumentException(
                        "You can only register under an approved doctor");

            Secretary secretary = new Secretary();
            secretary.setUser(user);
            secretary.setDoctor(assignedDoctor);
            secretary.setStatus("PENDING");
            secretaryRepository.save(secretary);

            return buildAuthResponse(user, null, null,
                    "Registration submitted. Please wait for Dr. "
                            + assignedDoctor.getUser().getFirstName() + " "
                            + assignedDoctor.getUser().getLastName()
                            + " to approve your request.");
        }

        throw new IllegalArgumentException("Invalid role: " + request.getRole());
    }

    // ── Login ─────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(
                        "Invalid email or password."));

        if ("BLOCKED".equalsIgnoreCase(user.getStatus()))
            throw new IllegalStateException(
                    "Your account has been suspended by the MediCore administrator. " +
                            "If you believe this is an error, please contact your administrator.");

        checkPendingRejected(user);

        String accessToken  = jwtUtil.generateAccessToken(
                user.getEmail(), user.getRole(),
                user.getFirstName(), user.getLastName());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken, null);
    }

    // ── Shared pending/rejected check ─────────────────────────────────────
    private void checkPendingRejected(User user) {
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Doctor record not found"));
            if ("PENDING".equalsIgnoreCase(doctor.getStatus()))
                throw new IllegalStateException(
                        "Your account is pending approval by the admin.");
            if ("REJECTED".equalsIgnoreCase(doctor.getStatus()))
                throw new IllegalStateException(
                        "Your registration was rejected. Please contact support.");
        }

        if ("SECRETARY".equalsIgnoreCase(user.getRole())) {
            Secretary secretary = secretaryRepository.findByUser(user)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Secretary record not found"));
            if ("PENDING".equalsIgnoreCase(secretary.getStatus()))
                throw new IllegalStateException(
                        "Your account is pending approval by your assigned doctor.");
            if ("REJECTED".equalsIgnoreCase(secretary.getStatus()))
                throw new IllegalStateException(
                        "Your registration was rejected by the doctor.");
        }
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