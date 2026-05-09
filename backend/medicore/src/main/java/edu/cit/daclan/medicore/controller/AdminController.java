package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.dto.response.ApiResponse;
import edu.cit.daclan.medicore.dto.response.DoctorSummaryResponse;
import edu.cit.daclan.medicore.entity.Appointment;
import edu.cit.daclan.medicore.entity.User;
import edu.cit.daclan.medicore.repository.AppointmentRepository;
import edu.cit.daclan.medicore.repository.SecretaryRepository;
import edu.cit.daclan.medicore.repository.UserRepository;
import edu.cit.daclan.medicore.service.DoctorApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final DoctorApprovalService  doctorApprovalService;
    private final SecretaryRepository    secretaryRepository;
    private final UserRepository         userRepository;
    private final AppointmentRepository  appointmentRepository;  // ← NEW

    public AdminController(DoctorApprovalService doctorApprovalService,
                           SecretaryRepository secretaryRepository,
                           UserRepository userRepository,
                           AppointmentRepository appointmentRepository) {   // ← NEW
        this.doctorApprovalService = doctorApprovalService;
        this.secretaryRepository   = secretaryRepository;
        this.userRepository        = userRepository;
        this.appointmentRepository = appointmentRepository;                 // ← NEW
    }

    // ── Users ─────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(this::toUserMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long userId) {
        userRepository.findById(userId).ifPresent(userRepository::delete);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(body.get("role").toUpperCase());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    @PutMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<Map<String, Object>>> blockUser(
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("BLOCKED");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unblockUser(
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    private Map<String, Object> toUserMap(User u) {
        String status = u.getStatus() != null ? u.getStatus() : "ACTIVE";
        return Map.of(
                "userId",      u.getUserId(),
                "firstName",   u.getFirstName()   != null ? u.getFirstName()   : "",
                "lastName",    u.getLastName()    != null ? u.getLastName()    : "",
                "email",       u.getEmail(),
                "role",        u.getRole()        != null ? u.getRole()        : "",
                "phoneNumber", u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                "status",      status
        );
    }

    // ── Doctors ───────────────────────────────────────────────────────────

    @GetMapping("/doctors/pending")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getPendingDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorApprovalService.getPendingDoctors()));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorSummaryResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorApprovalService.getAllDoctors()));
    }

    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> approveDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "APPROVED")));
    }

    @PutMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> rejectDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "REJECTED")));
    }

    // ── Secretary Assignments ─────────────────────────────────────────────

    @GetMapping("/secretary-assignments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSecretaryAssignments() {
        List<Map<String, Object>> assignments = secretaryRepository.findAll()
                .stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .map(s -> {
                    var docUser = s.getDoctor().getUser();
                    var secUser = s.getUser();
                    return Map.<String, Object>of(
                            "secretaryId",    s.getSecretaryId(),
                            "secretaryName",  secUser.getFirstName() + " " + secUser.getLastName(),
                            "secretaryEmail", secUser.getEmail(),
                            "doctorId",       s.getDoctor().getDoctorId(),
                            "doctorName",     "Dr. " + docUser.getFirstName() + " " + docUser.getLastName(),
                            "doctorEmail",    docUser.getEmail(),
                            "specialization", s.getDoctor().getSpecialization(),
                            "assignedSince",  s.getRequestedAt() != null ? s.getRequestedAt().toString() : ""
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    // ── Analytics ─────────────────────────────────────────────────────────
    // GET /api/v1/admin/analytics
    //
    // Returns a single object with real counts for users, doctors,
    // appointments (by status, daily this week, monthly this year), and
    // secretary assignments — no placeholder data.

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {

        // ── 1. Users ──────────────────────────────────────────────────────
        List<User> allUsers = userRepository.findAll();

        Map<String, Object> usersMap = new LinkedHashMap<>();
        usersMap.put("total",      (long) allUsers.size());
        usersMap.put("patients",   allUsers.stream().filter(u -> "PATIENT".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("doctors",    allUsers.stream().filter(u -> "DOCTOR".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("secretaries",allUsers.stream().filter(u -> "SECRETARY".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("admins",     allUsers.stream().filter(u -> "ADMIN".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("blocked",    allUsers.stream().filter(u -> "BLOCKED".equalsIgnoreCase(u.getStatus())).count());

        // ── 2. Doctors ────────────────────────────────────────────────────
        List<DoctorSummaryResponse> doctorSummaries = doctorApprovalService.getAllDoctors();

        Map<String, Object> doctorsMap = new LinkedHashMap<>();
        doctorsMap.put("total",    (long) doctorSummaries.size());
        doctorsMap.put("approved", doctorSummaries.stream().filter(d -> "APPROVED".equalsIgnoreCase(d.getStatus())).count());
        doctorsMap.put("pending",  doctorSummaries.stream().filter(d -> "PENDING".equalsIgnoreCase(d.getStatus())).count());
        doctorsMap.put("rejected", doctorSummaries.stream().filter(d -> "REJECTED".equalsIgnoreCase(d.getStatus())).count());

        // ── 3. Appointments ───────────────────────────────────────────────
        List<Appointment> allAppts = appointmentRepository.findAll();

        long apptPending   = allAppts.stream().filter(a -> "PENDING".equalsIgnoreCase(a.getStatus())).count();
        long apptApproved  = allAppts.stream().filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus())).count();
        long apptRejected  = allAppts.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus())).count();
        long apptCompleted = allAppts.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();

        // Today's count (requestedDate is stored as "yyyy-MM-dd" String)
        String    todayStr = LocalDate.now().toString();
        LocalDate today    = LocalDate.now();
        long todayTotal = allAppts.stream()
                .filter(a -> todayStr.equals(a.getRequestedDate()))
                .count();

        // This week Mon–Sun
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        List<Map<String, Object>> weeklyList = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day    = weekStart.plusDays(i);
            String    dayStr = day.toString();
            long count = allAppts.stream()
                    .filter(a -> dayStr.equals(a.getRequestedDate()))
                    .count();
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("date",  dayStr);
            entry.put("count", count);
            weeklyList.add(entry);
        }

        // This year Jan–Dec
        int currentYear = today.getYear();
        List<Map<String, Object>> monthlyList = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthPrefix = String.format("%d-%02d-", currentYear, m);
            long count = allAppts.stream()
                    .filter(a -> a.getRequestedDate() != null
                            && a.getRequestedDate().startsWith(monthPrefix))
                    .count();
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("month", m);
            entry.put("count", count);
            monthlyList.add(entry);
        }

        Map<String, Object> appointmentsMap = new LinkedHashMap<>();
        appointmentsMap.put("total",     (long) allAppts.size());
        appointmentsMap.put("pending",   apptPending);
        appointmentsMap.put("approved",  apptApproved);
        appointmentsMap.put("rejected",  apptRejected);
        appointmentsMap.put("completed", apptCompleted);
        appointmentsMap.put("today",     todayTotal);
        appointmentsMap.put("weekly",    weeklyList);
        appointmentsMap.put("monthly",   monthlyList);

        // ── 4. Secretary assignments ──────────────────────────────────────
        long assignedSecretaries = secretaryRepository.findAll().stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .count();

        // ── 5. Assemble ───────────────────────────────────────────────────
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("users",               usersMap);
        result.put("doctors",             doctorsMap);
        result.put("appointments",        appointmentsMap);
        result.put("assignedSecretaries", assignedSecretaries);

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}