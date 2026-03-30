package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/doctors")
public class PatientController {

    private final DoctorRepository doctorRepository;

    public PatientController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getApprovedDoctors() {
        List<DoctorSummaryResponse> doctors = doctorRepository
                .findAllByStatus("APPROVED")
                .stream()
                .filter(doc -> doc.getUser() != null)          // skip any orphaned doctor records
                .map(doc -> {
                    User u = doc.getUser();
                    return DoctorSummaryResponse.builder()
                            .doctorId(doc.getDoctorId())
                            .firstName(u.getFirstName()   != null ? u.getFirstName()   : "")
                            .lastName(u.getLastName()    != null ? u.getLastName()    : "")
                            .email(u.getEmail()          != null ? u.getEmail()        : "")
                            .phoneNumber(u.getPhoneNumber())       // null is fine — frontend guards it
                            .specialization(doc.getSpecialization() != null ? doc.getSpecialization() : "")
                            .licenseNumber(doc.getLicenseNumber())  // null is fine
                            .profilePicture(doc.getProfilePicture()) // null is fine
                            .status(doc.getStatus()      != null ? doc.getStatus()     : "")
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(doctors));
    }
}