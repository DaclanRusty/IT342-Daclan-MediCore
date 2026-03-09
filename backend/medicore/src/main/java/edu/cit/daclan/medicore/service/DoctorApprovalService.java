package edu.cit.daclan.medicore.service;

import edu.cit.daclan.medicore.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class DoctorApprovalService {

    private final DoctorRepository doctorRepository;

    public DoctorApprovalService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<DoctorSummaryResponse> getPendingDoctors() {
        return doctorRepository.findAllByStatus("PENDING")
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public List<DoctorSummaryResponse> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional
    public DoctorSummaryResponse updateDoctorStatus(UUID doctorId, String newStatus) {
        String upper = newStatus.toUpperCase();
        if (!upper.equals("APPROVED") && !upper.equals("REJECTED")) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        doctor.setStatus(upper);
        doctorRepository.save(doctor);
        return toSummary(doctor);
    }

    private DoctorSummaryResponse toSummary(Doctor d) {
        return DoctorSummaryResponse.builder()
                .doctorId(d.getDoctorId())
                .firstName(d.getUser().getFirstName())
                .lastName(d.getUser().getLastName())
                .email(d.getUser().getEmail())
                .phoneNumber(d.getUser().getPhoneNumber())      // ← added
                .specialization(d.getSpecialization())
                .licenseNumber(d.getLicenseNumber())
                .profilePicture(d.getProfilePicture())          // ← added
                .status(d.getStatus())
                .build();
    }
}