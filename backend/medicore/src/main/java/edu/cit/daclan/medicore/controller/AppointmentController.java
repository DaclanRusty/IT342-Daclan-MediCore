package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.request.AppointmentRequest;
import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.AppointmentResponse;
import edu.cit.daclan.medicore.entity.Appointment;
import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.Patient;
import edu.cit.daclan.medicore.entity.Secretary;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.AppointmentRepository;
import edu.cit.daclan.medicore.repository.DoctorRepository;
import edu.cit.daclan.medicore.repository.PatientRepository;
import edu.cit.daclan.medicore.repository.SecretaryRepository;
import edu.cit.daclan.medicore.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final SecretaryRepository secretaryRepository;
    private final PatientRepository patientRepository;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            SecretaryRepository secretaryRepository,
            PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.secretaryRepository = secretaryRepository;
        this.patientRepository = patientRepository;
    }

    // ── Resolve User from JWT ────────────────────────────────────────
    private User resolveUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    // ── Map Appointment → Response ───────────────────────────────────
    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse.DoctorInfo di = new AppointmentResponse.DoctorInfo();
        di.setDoctorId(a.getDoctor().getDoctorId());
        di.setFirstName(a.getDoctor().getUser().getFirstName());
        di.setLastName(a.getDoctor().getUser().getLastName());
        di.setSpecialization(a.getDoctor().getSpecialization());
        di.setProfilePicture(a.getDoctor().getProfilePicture());

        AppointmentResponse.PatientInfo pi = new AppointmentResponse.PatientInfo();
        pi.setPatientId(a.getPatient().getPatientId());
        pi.setFirstName(a.getPatient().getUser().getFirstName());
        pi.setLastName(a.getPatient().getUser().getLastName());
        pi.setEmail(a.getPatient().getUser().getEmail());

        return AppointmentResponse.builder()
                .id(a.getId())
                .requestedDate(a.getRequestedDate())
                .requestedTime(a.getRequestedTime())
                .reasonForVisit(a.getReasonForVisit())
                .status(a.getStatus())
                .doctor(di)
                .patient(pi)
                .build();
    }

    // ── Patient books appointment ────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @RequestBody AppointmentRequest req,
            Authentication auth) {

        User user = resolveUser(auth);

        if (req.getDoctorId() == null || req.getRequestedDate() == null
                || req.getRequestedTime() == null || req.getReasonForVisit() == null
                || req.getReasonForVisit().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("All fields are required."));
        }

        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }

        Doctor doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        if (doctor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor not found."));
        }

        boolean slotTaken = appointmentRepository
                .existsByDoctorAndRequestedDateAndRequestedTime(
                        doctor, req.getRequestedDate(), req.getRequestedTime());

        if (slotTaken) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Time slot already booked."));
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setRequestedDate(req.getRequestedDate());
        appointment.setRequestedTime(req.getRequestedTime());
        appointment.setReasonForVisit(req.getReasonForVisit());
        appointment.setStatus("PENDING");

        Appointment saved = appointmentRepository.save(appointment);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(saved)));
    }

    // ── Patient views own appointments ───────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Patient patient = patientRepository.findByUser(user).orElse(null);

        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found."));
        }

        List<AppointmentResponse> list = appointmentRepository
                .findAllByPatient(patient)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── Doctor views approved appointments ───────────────────────────
    @GetMapping("/doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Doctor doctor = doctorRepository.findByUser(user).orElse(null);

        if (doctor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor profile not found."));
        }

        List<AppointmentResponse> list = appointmentRepository
                .findAllByDoctorAndStatus(doctor, "APPROVED")
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── Secretary views appointments ─────────────────────────────────
    @GetMapping("/secretary")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getSecretaryAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);

        if (secretary == null || secretary.getDoctor() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Secretary profile or doctor assignment not found."));
        }

        // ✅ NEW: block unapproved secretary
        if (!"APPROVED".equals(secretary.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your account is pending doctor approval."));
        }

        List<AppointmentResponse> list = appointmentRepository
                .findAllByDoctor(secretary.getDoctor())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── Approve appointment ──────────────────────────────────────────
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AppointmentResponse>> approveAppointment(
            @PathVariable Long id,
            Authentication auth) {

        return updateStatus(id, auth, "APPROVED");
    }

    // ── Reject appointment ───────────────────────────────────────────
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rejectAppointment(
            @PathVariable Long id,
            Authentication auth) {

        return updateStatus(id, auth, "REJECTED");
    }

    // ── Update status helper ─────────────────────────────────────────
    private ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            Long id, Authentication auth, String newStatus) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);

        if (secretary == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only a secretary can manage appointments."));
        }

        // ✅ NEW: block unapproved secretary
        if (!"APPROVED".equals(secretary.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your account is pending doctor approval."));
        }

        Appointment a = appointmentRepository.findById(id).orElse(null);
        if (a == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }

        if (!a.getDoctor().getDoctorId().equals(secretary.getDoctor().getDoctorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Unauthorized."));
        }

        a.setStatus(newStatus);
        Appointment updated = appointmentRepository.save(a);

        return ResponseEntity.ok(ApiResponse.success(toResponse(updated)));
    }
}