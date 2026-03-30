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
    private final DoctorRepository      doctorRepository;
    private final UserRepository        userRepository;
    private final SecretaryRepository   secretaryRepository;
    private final PatientRepository     patientRepository;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            DoctorRepository      doctorRepository,
            UserRepository        userRepository,
            SecretaryRepository   secretaryRepository,
            PatientRepository     patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository      = doctorRepository;
        this.userRepository        = userRepository;
        this.secretaryRepository   = secretaryRepository;
        this.patientRepository     = patientRepository;
    }

    // ── Helper: resolve User from JWT ────────────────────────────────────────
    private User resolveUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    // ── Helper: map Appointment → AppointmentResponse ────────────────────────
    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse.DoctorInfo di = new AppointmentResponse.DoctorInfo();
        di.setDoctorId(a.getDoctor().getDoctorId());
        di.setFirstName(a.getDoctor().getUser().getFirstName());
        di.setLastName(a.getDoctor().getUser().getLastName());
        di.setSpecialization(a.getDoctor().getSpecialization());
        di.setProfilePicture(a.getDoctor().getProfilePicture());

        return AppointmentResponse.builder()
                .id(a.getId())
                .requestedDate(a.getRequestedDate())
                .requestedTime(a.getRequestedTime())
                .reasonForVisit(a.getReasonForVisit())
                .status(a.getStatus())
                .doctor(di)
                .build();
    }

    // ── POST /api/v1/appointments — Patient books ─────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @RequestBody AppointmentRequest req,
            Authentication auth) {

        // 1. Resolve user from JWT
        User user = resolveUser(auth);

        // 2. Validate request fields
        if (req.getDoctorId() == null || req.getRequestedDate() == null
                || req.getRequestedTime() == null || req.getReasonForVisit() == null
                || req.getReasonForVisit().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("All fields are required."));
        }

        // 3. Resolve Patient profile (FK points to patients table, not users)
        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient profile not found for this account."));
        }

        // 4. Find doctor
        Doctor doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        if (doctor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Doctor not found."));
        }

        // 5. Conflict check — one appointment per slot per doctor
        boolean slotTaken = appointmentRepository
                .existsByDoctorAndRequestedDateAndRequestedTime(
                        doctor, req.getRequestedDate(), req.getRequestedTime());
        if (slotTaken) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("APPT-001: That time slot is already booked. " +
                            "Please choose a different date or time."));
        }

        // 6. Save appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);   // ← now correctly sets Patient entity
        appointment.setDoctor(doctor);
        appointment.setRequestedDate(req.getRequestedDate());
        appointment.setRequestedTime(req.getRequestedTime());
        appointment.setReasonForVisit(req.getReasonForVisit());
        appointment.setStatus("PENDING");

        Appointment saved = appointmentRepository.save(appointment);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(saved)));
    }

    // ── GET /api/v1/appointments/me — Patient views own appointments ──────────
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(
            Authentication auth) {

        User user = resolveUser(auth);

        // Resolve Patient profile
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

    // ── GET /api/v1/appointments/{id} — Single appointment detail ────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(
            @PathVariable Long id,
            Authentication auth) {

        User user = resolveUser(auth);
        Appointment a = appointmentRepository.findById(id).orElse(null);

        if (a == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }

        // Only the patient who owns it, their doctor, or admin can view it
        boolean isPatient = a.getPatient().getUser().getUserId().equals(user.getUserId());
        boolean isDoctor  = a.getDoctor().getUser().getUserId().equals(user.getUserId());
        boolean isAdmin   = user.getRole().equals("ROLE_ADMIN");

        if (!isPatient && !isDoctor && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied."));
        }

        return ResponseEntity.ok(ApiResponse.success(toResponse(a)));
    }

    // ── GET /api/v1/appointments/doctor — Doctor views APPROVED appointments ──
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

    // ── GET /api/v1/appointments/secretary — Secretary views pending ──────────
    @GetMapping("/secretary")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getSecretaryAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);

        if (secretary == null || secretary.getDoctor() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Secretary profile or doctor assignment not found."));
        }

        List<AppointmentResponse> list = appointmentRepository
                .findPendingByDoctor(secretary.getDoctor())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── PUT /api/v1/appointments/{id}/approve — Secretary approves ────────────
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AppointmentResponse>> approveAppointment(
            @PathVariable Long id,
            Authentication auth) {

        return updateStatus(id, auth, "APPROVED");
    }

    // ── PUT /api/v1/appointments/{id}/reject — Secretary rejects ─────────────
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rejectAppointment(
            @PathVariable Long id,
            Authentication auth) {

        return updateStatus(id, auth, "REJECTED");
    }

    // ── Private helper: approve or reject ────────────────────────────────────
    private ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            Long id, Authentication auth, String newStatus) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);

        if (secretary == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only a secretary can manage appointments."));
        }

        Appointment a = appointmentRepository.findById(id).orElse(null);
        if (a == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Appointment not found."));
        }

        if (!a.getDoctor().getDoctorId().equals(secretary.getDoctor().getDoctorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only manage appointments for your assigned doctor."));
        }

        a.setStatus(newStatus);
        return ResponseEntity.ok(ApiResponse.success(toResponse(appointmentRepository.save(a))));
    }
}