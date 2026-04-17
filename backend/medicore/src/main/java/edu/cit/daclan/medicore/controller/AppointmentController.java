package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.request.AppointmentRequest;
import edu.cit.daclan.medicore.dto.request.CancelAppointmentRequest;
import edu.cit.daclan.medicore.dto.request.CompleteAppointmentRequest;
import edu.cit.daclan.medicore.dto.request.RejectAppointmentRequest;
import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.AppointmentResponse;
import edu.cit.daclan.medicore.entity.*;
import edu.cit.daclan.medicore.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            SecretaryRepository secretaryRepository,
            PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository      = doctorRepository;
        this.userRepository        = userRepository;
        this.secretaryRepository   = secretaryRepository;
        this.patientRepository     = patientRepository;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + auth.getName()));
    }

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
                .completedAt(a.getCompletedAt())
                .doctorNotes(a.getDoctorNotes())
                .cancelledAt(a.getCancelledAt())
                .cancelReason(a.getCancelReason())
                .rejectedAt(a.getRejectedAt())
                .rejectedReason(a.getRejectedReason())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    // PATIENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /api/v1/appointments
     * Patient books an appointment → starts as PENDING
     */
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
        if (patient == null) return notFound("Patient profile not found.");

        Doctor doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        if (doctor == null) return notFound("Doctor not found.");

        // Only block slots that are still active (PENDING or CONFIRMED)
        boolean slotTaken = appointmentRepository
                .existsByDoctorAndRequestedDateAndRequestedTimeAndStatusIn(
                        doctor, req.getRequestedDate(), req.getRequestedTime(),
                        List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED));

        if (slotTaken) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("This time slot is already booked."));
        }

        Appointment a = new Appointment();
        a.setPatient(patient);
        a.setDoctor(doctor);
        a.setRequestedDate(req.getRequestedDate());
        a.setRequestedTime(req.getRequestedTime());
        a.setReasonForVisit(req.getReasonForVisit());
        a.setStatus(AppointmentStatus.PENDING);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(appointmentRepository.save(a))));
    }

    /**
     * GET /api/v1/appointments/me
     * Patient sees all their appointments (all statuses)
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Patient patient = patientRepository.findByUser(user).orElse(null);
        if (patient == null) return notFound("Patient profile not found.");

        List<AppointmentResponse> list = appointmentRepository
                .findAllByPatient(patient)
                .stream().map(this::toResponse).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ═══════════════════════════════════════════════════════════════
    // DOCTOR ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/appointments/doctor
     * Doctor sees CONFIRMED + COMPLETED + CANCELLED appointments
     */
    @GetMapping("/doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Doctor doctor = doctorRepository.findByUser(user).orElse(null);
        if (doctor == null) return notFound("Doctor profile not found.");

        List<AppointmentResponse> list = appointmentRepository
                .findAllByDoctorAndStatusIn(doctor, List.of(
                        AppointmentStatus.CONFIRMED,
                        AppointmentStatus.COMPLETED,
                        AppointmentStatus.CANCELLED))
                .stream().map(this::toResponse).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * PUT /api/v1/appointments/{id}/complete
     * Doctor marks appointment as COMPLETED with optional notes
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteAppointmentRequest req,
            Authentication auth) {

        User user = resolveUser(auth);
        Doctor doctor = doctorRepository.findByUser(user).orElse(null);
        if (doctor == null) return forbidden("Only a doctor can mark appointments as completed.");

        Appointment a = appointmentRepository.findById(id).orElse(null);
        if (a == null) return notFound("Appointment not found.");

        if (!a.getDoctor().getDoctorId().equals(doctor.getDoctorId()))
            return forbidden("You can only complete your own appointments.");

        if (a.getStatus() != AppointmentStatus.CONFIRMED)
            return badRequest("Only CONFIRMED appointments can be marked as completed.");

        a.setStatus(AppointmentStatus.COMPLETED);
        a.setCompletedAt(LocalDateTime.now());
        if (req != null && req.getDoctorNotes() != null) {
            a.setDoctorNotes(req.getDoctorNotes());
        }

        return ResponseEntity.ok(ApiResponse.success(toResponse(appointmentRepository.save(a))));
    }

    /**
     * PUT /api/v1/appointments/{id}/cancel
     * Doctor OR Secretary cancels an appointment with a reason
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) CancelAppointmentRequest req,
            Authentication auth) {

        User user = resolveUser(auth);

        // Determine who is cancelling
        Doctor doctor       = doctorRepository.findByUser(user).orElse(null);
        Secretary secretary  = secretaryRepository.findByUser(user).orElse(null);

        if (doctor == null && secretary == null)
            return forbidden("Only a doctor or secretary can cancel appointments.");

        Appointment a = appointmentRepository.findById(id).orElse(null);
        if (a == null) return notFound("Appointment not found.");

        // Authorization: must belong to their doctor
        Long appointmentDoctorId = a.getDoctor().getDoctorId();
        if (doctor != null && !appointmentDoctorId.equals(doctor.getDoctorId()))
            return forbidden("You can only cancel your own appointments.");
        if (secretary != null && !appointmentDoctorId.equals(secretary.getDoctor().getDoctorId()))
            return forbidden("You can only cancel appointments for your assigned doctor.");

        // Secretary must be approved
        if (secretary != null && !"APPROVED".equals(secretary.getStatus()))
            return forbidden("Your account is pending doctor approval.");

        // Only PENDING or CONFIRMED can be cancelled
        if (a.getStatus() != AppointmentStatus.PENDING
                && a.getStatus() != AppointmentStatus.CONFIRMED)
            return badRequest("Only PENDING or CONFIRMED appointments can be cancelled.");

        a.setStatus(AppointmentStatus.CANCELLED);
        a.setCancelledAt(LocalDateTime.now());
        if (req != null && req.getCancelReason() != null) {
            a.setCancelReason(req.getCancelReason());
        }

        return ResponseEntity.ok(ApiResponse.success(toResponse(appointmentRepository.save(a))));
    }

    // ═══════════════════════════════════════════════════════════════
    // SECRETARY ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/appointments/secretary
     * Secretary sees ALL appointments for their assigned doctor
     */
    @GetMapping("/secretary")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getSecretaryAppointments(
            Authentication auth) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);

        if (secretary == null || secretary.getDoctor() == null)
            return notFound("Secretary profile or doctor assignment not found.");
        if (!"APPROVED".equals(secretary.getStatus()))
            return forbidden("Your account is pending doctor approval.");

        List<AppointmentResponse> list = appointmentRepository
                .findAllByDoctor(secretary.getDoctor())
                .stream().map(this::toResponse).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * PUT /api/v1/appointments/{id}/confirm
     * Secretary confirms (approves) a PENDING appointment
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(
            @PathVariable Long id,
            Authentication auth) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);
        if (secretary == null) return forbidden("Only a secretary can confirm appointments.");
        if (!"APPROVED".equals(secretary.getStatus())) return forbidden("Your account is pending doctor approval.");

        Appointment a = appointmentRepository.findById(id).orElse(null);
        if (a == null) return notFound("Appointment not found.");

        if (!a.getDoctor().getDoctorId().equals(secretary.getDoctor().getDoctorId()))
            return forbidden("Unauthorized.");

        if (a.getStatus() != AppointmentStatus.PENDING)
            return badRequest("Only PENDING appointments can be confirmed.");

        a.setStatus(AppointmentStatus.CONFIRMED);
        return ResponseEntity.ok(ApiResponse.success(toResponse(appointmentRepository.save(a))));
    }

    /**
     * PUT /api/v1/appointments/{id}/reject
     * Secretary rejects a PENDING appointment with optional reason
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rejectAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) RejectAppointmentRequest req,
            Authentication auth) {

        User user = resolveUser(auth);
        Secretary secretary = secretaryRepository.findByUser(user).orElse(null);
        if (secretary == null) return forbidden("Only a secretary can reject appointments.");
        if (!"APPROVED".equals(secretary.getStatus())) return forbidden("Your account is pending doctor approval.");

        Appointment a = appointmentRepository.findById(id).orElse(null);
        if (a == null) return notFound("Appointment not found.");

        if (!a.getDoctor().getDoctorId().equals(secretary.getDoctor().getDoctorId()))
            return forbidden("Unauthorized.");

        if (a.getStatus() != AppointmentStatus.PENDING)
            return badRequest("Only PENDING appointments can be rejected.");

        a.setStatus(AppointmentStatus.REJECTED);
        a.setRejectedAt(LocalDateTime.now());
        if (req != null && req.getRejectedReason() != null) {
            a.setRejectedReason(req.getRejectedReason());
        }

        return ResponseEntity.ok(ApiResponse.success(toResponse(appointmentRepository.save(a))));
    }

    // ═══════════════════════════════════════════════════════════════
    // Response shorthand helpers
    // ═══════════════════════════════════════════════════════════════

    private <T> ResponseEntity<ApiResponse<T>> notFound(String msg) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(msg));
    }

    private <T> ResponseEntity<ApiResponse<T>> forbidden(String msg) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(msg));
    }

    private <T> ResponseEntity<ApiResponse<T>> badRequest(String msg) {
        return ResponseEntity.badRequest().body(ApiResponse.error(msg));
    }
}