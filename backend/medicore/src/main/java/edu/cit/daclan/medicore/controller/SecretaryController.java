package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.entity.Secretary;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.SecretaryRepository;
import edu.cit.daclan.medicore.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/secretary")
public class SecretaryController {

    private final SecretaryRepository secretaryRepository;
    private final UserRepository      userRepository;

    public SecretaryController(SecretaryRepository secretaryRepository,
                               UserRepository userRepository) {
        this.secretaryRepository = secretaryRepository;
        this.userRepository      = userRepository;
    }

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // GET /api/v1/secretary/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(Authentication auth) {
        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);

        if (secretary == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Secretary profile not found."));
        }

        // Build flat response map
        Map<String, Object> profile = new java.util.LinkedHashMap<>();
        profile.put("secretaryId",  secretary.getSecretaryId());
        profile.put("firstName",    user.getFirstName());
        profile.put("lastName",     user.getLastName());
        profile.put("email",        user.getEmail());
        profile.put("phoneNumber",  user.getPhoneNumber());
        profile.put("status",       secretary.getStatus());

        // Assigned doctor info
        if (secretary.getDoctor() != null) {
            Map<String, Object> doc = new java.util.LinkedHashMap<>();
            doc.put("doctorId",       secretary.getDoctor().getDoctorId());
            doc.put("firstName",      secretary.getDoctor().getUser().getFirstName());
            doc.put("lastName",       secretary.getDoctor().getUser().getLastName());
            doc.put("specialization", secretary.getDoctor().getSpecialization());
            doc.put("profilePicture", secretary.getDoctor().getProfilePicture());
            profile.put("assignedDoctor", doc);
        } else {
            profile.put("assignedDoctor", null);
        }

        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}