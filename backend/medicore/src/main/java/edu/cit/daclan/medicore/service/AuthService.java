package edu.cit.daclan.medicore.service;

import edu.cit.daclan.medicore.dto.request.*;
import edu.cit.daclan.medicore.dto.response.*;
import edu.cit.daclan.medicore.entity.*;
import edu.cit.daclan.medicore.repository.*;
import edu.cit.daclan.medicore.security.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank()) {
                throw new IllegalArgumentException("License number is required for doctors");
            }
            if (request.getSpecialization() == null || request.getSpecialization().isBlank()) {
                throw new IllegalArgumentException("Specialization is required for doctors");
            }
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new IllegalArgumentException("License number is already registered");
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole().toUpperCase())
                .build();
        userRepository.save(user);

        if ("PATIENT".equalsIgnoreCase(request.getRole())) {
            Patient patient = Patient.builder()
                    .user(user)
                    .dateOfBirth(LocalDate.parse(request.getDateOfBirth()))
                    .gender(request.getGender().toUpperCase())
                    .address(request.getAddress())
                    .build();
            patientRepository.save(patient);

        } else if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .licenseNumber(request.getLicenseNumber())
                    .specialization(request.getSpecialization())
                    .build();
            doctorRepository.save(doctor);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .user(AuthResponse.UserInfo.builder()
                        .email(user.getEmail())
                        .firstname(user.getFirstName())
                        .lastname(user.getLastName())
                        .role(user.getRole())
                        .build())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}