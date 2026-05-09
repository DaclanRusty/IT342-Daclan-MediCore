package edu.cit.daclan.medicore.feature.doctor.service.impl;

import edu.cit.daclan.medicore.dto.DoctorProfileResponse;
import edu.cit.daclan.medicore.dto.DoctorProfileUpdateRequest;
import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.auth.entity.User;
import edu.cit.daclan.medicore.feature.doctor.repository.DoctorRepository;
import edu.cit.daclan.medicore.feature.auth.repository.UserRepository;
import edu.cit.daclan.medicore.feature.doctor.service.DoctorService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;

    public DoctorServiceImpl(DoctorRepository doctorRepository,
                             UserRepository userRepository,
                             PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.userRepository   = userRepository;
        this.passwordEncoder  = passwordEncoder;
    }

    // ── GET profile ───────────────────────────────────────────────────────
    @Override
    public DoctorProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return mapToResponse(doctor);
    }

    // ── UPDATE profile ────────────────────────────────────────────────────
    @Override
    public DoctorProfileResponse updateMyProfile(String email, DoctorProfileUpdateRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (req.getFirstName()  != null) user.setFirstName(req.getFirstName());
        if (req.getLastName()   != null) user.setLastName(req.getLastName());
        if (req.getPhoneNumber()!= null) user.setPhoneNumber(req.getPhoneNumber());

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank())
                throw new RuntimeException("Current password is required to set a new password.");
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
                throw new RuntimeException("Current password is incorrect.");
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        userRepository.save(user);

        if (req.getSpecialization()    != null) doctor.setSpecialization(req.getSpecialization());
        if (req.getYearsOfExperience() != null) doctor.setYearsOfExperience(req.getYearsOfExperience());
        if (req.getBio()               != null) doctor.setBio(req.getBio());

        doctorRepository.save(doctor);
        return mapToResponse(doctor);
    }

    // ── UPDATE profile picture — now saves to users table ─────────────────
    @Override
    @Transactional
    public DoctorProfileResponse updateProfilePicture(String email, String base64Image) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // ✅ Save to user.profilePicture (users table) instead of doctor.profilePicture
        user.setProfilePicture(base64Image);
        userRepository.save(user);
        return getMyProfile(email);
    }

    // ── Helper — reads profilePicture from User ───────────────────────────
    private DoctorProfileResponse mapToResponse(Doctor doctor) {
        User user = doctor.getUser();
        return DoctorProfileResponse.builder()
                .doctorId(doctor.getDoctorId())
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .profilePicture(user.getProfilePicture())  // ✅ from users table now
                .status(doctor.getStatus())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .bio(doctor.getBio())
                .build();
    }
}
