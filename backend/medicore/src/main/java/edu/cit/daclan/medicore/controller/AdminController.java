package edu.cit.daclan.medicore.controller;

import edu.cit.daclan.medicore.entity.AppointmentStatus;
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

    private final DoctorApprovalService doctorApprovalService;
    private final SecretaryRepository   secretaryRepository;
    private final UserRepository        userRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminController(DoctorApprovalService doctorApprovalService,
                           SecretaryRepository secretaryRepository,
                           UserRepository userRepository,
                           AppointmentRepository appointmentRepository) {
        this.doctorApprovalService = doctorApprovalService;
        this.secretaryRepository   = secretaryRepository;
        this.userRepository        = userRepository;
        this.appointmentRepository = appointmentRepository;
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
    public ResponseEntity<ApiResponse<Map<String, Object>>> blockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("BLOCKED");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    @PutMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unblockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(toUserMap(user)));
    }

    // ── toUserMap — now includes profilePicture ───────────────────────────
    private Map<String, Object> toUserMap(User u) {
        String status = u.getStatus() != null ? u.getStatus() : "ACTIVE";
        Map<String, Object> map = new java.util.LinkedHashMap<>();
        map.put("userId",         u.getUserId());
        map.put("firstName",      u.getFirstName()    != null ? u.getFirstName()    : "");
        map.put("lastName",       u.getLastName()     != null ? u.getLastName()     : "");
        map.put("email",          u.getEmail());
        map.put("role",           u.getRole()         != null ? u.getRole()         : "");
        map.put("phoneNumber",    u.getPhoneNumber()  != null ? u.getPhoneNumber()  : "");
        map.put("status",         status);
        map.put("profilePicture", u.getProfilePicture() != null ? u.getProfilePicture() : ""); // 👈 added
        return map;
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
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> approveDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "APPROVED")));
    }

    @PutMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<ApiResponse<DoctorSummaryResponse>> rejectDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorApprovalService.updateDoctorStatus(doctorId, "REJECTED")));
    }

    // ── Secretary Assignments — now includes profile pictures ─────────────

    @GetMapping("/secretary-assignments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSecretaryAssignments() {
        List<Map<String, Object>> assignments = secretaryRepository.findAll()
                .stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .map(s -> {
                    var docUser = s.getDoctor().getUser();
                    var secUser = s.getUser();
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("secretaryId",           s.getSecretaryId());
                    m.put("secretaryName",         secUser.getFirstName() + " " + secUser.getLastName());
                    m.put("secretaryEmail",        secUser.getEmail());
                    m.put("secretaryProfilePicture", secUser.getProfilePicture() != null ? secUser.getProfilePicture() : ""); // 👈 added
                    m.put("doctorId",              s.getDoctor().getDoctorId());
                    m.put("doctorName",            "Dr. " + docUser.getFirstName() + " " + docUser.getLastName());
                    m.put("doctorEmail",           docUser.getEmail());
                    m.put("doctorProfilePicture",  docUser.getProfilePicture() != null ? docUser.getProfilePicture() : "");   // 👈 added
                    m.put("specialization",        s.getDoctor().getSpecialization());
                    m.put("assignedSince",         s.getRequestedAt() != null ? s.getRequestedAt().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    // ── Analytics ─────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {

        List<User> allUsers = userRepository.findAll();

        Map<String, Object> usersMap = new LinkedHashMap<>();
        usersMap.put("total",       (long) allUsers.size());
        usersMap.put("patients",    allUsers.stream().filter(u -> "PATIENT".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("doctors",     allUsers.stream().filter(u -> "DOCTOR".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("secretaries", allUsers.stream().filter(u -> "SECRETARY".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("admins",      allUsers.stream().filter(u -> "ADMIN".equalsIgnoreCase(u.getRole())).count());
        usersMap.put("blocked",     allUsers.stream().filter(u -> "BLOCKED".equalsIgnoreCase(u.getStatus())).count());

        List<DoctorSummaryResponse> doctorSummaries = doctorApprovalService.getAllDoctors();

        Map<String, Object> doctorsMap = new LinkedHashMap<>();
        doctorsMap.put("total",    (long) doctorSummaries.size());
        doctorsMap.put("approved", doctorSummaries.stream().filter(d -> "APPROVED".equalsIgnoreCase(d.getStatus())).count());
        doctorsMap.put("pending",  doctorSummaries.stream().filter(d -> "PENDING".equalsIgnoreCase(d.getStatus())).count());
        doctorsMap.put("rejected", doctorSummaries.stream().filter(d -> "REJECTED".equalsIgnoreCase(d.getStatus())).count());

        List<Appointment> allAppts = appointmentRepository.findAll();

        long apptPending   = allAppts.stream().filter(a -> AppointmentStatus.PENDING   == a.getStatus()).count();
        long apptConfirmed = allAppts.stream().filter(a -> AppointmentStatus.CONFIRMED == a.getStatus()).count();
        long apptRejected  = allAppts.stream().filter(a -> AppointmentStatus.REJECTED  == a.getStatus()).count();
        long apptCompleted = allAppts.stream().filter(a -> AppointmentStatus.COMPLETED == a.getStatus()).count();
        long apptCancelled = allAppts.stream().filter(a -> AppointmentStatus.CANCELLED == a.getStatus()).count();

        String    todayStr   = LocalDate.now().toString();
        LocalDate today      = LocalDate.now();
        long      todayTotal = allAppts.stream().filter(a -> todayStr.equals(a.getRequestedDate())).count();

        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        List<Map<String, Object>> weeklyList = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day    = weekStart.plusDays(i);
            String    dayStr = day.toString();
            long count = allAppts.stream().filter(a -> dayStr.equals(a.getRequestedDate())).count();
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("date",  dayStr);
            entry.put("count", count);
            weeklyList.add(entry);
        }

        int currentYear = today.getYear();
        List<Map<String, Object>> monthlyList = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthPrefix = String.format("%d-%02d-", currentYear, m);
            long count = allAppts.stream()
                    .filter(a -> a.getRequestedDate() != null && a.getRequestedDate().startsWith(monthPrefix))
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
        appointmentsMap.put("confirmed", apptConfirmed);
        appointmentsMap.put("rejected",  apptRejected);
        appointmentsMap.put("completed", apptCompleted);
        appointmentsMap.put("cancelled", apptCancelled);
        appointmentsMap.put("today",     todayTotal);
        appointmentsMap.put("weekly",    weeklyList);
        appointmentsMap.put("monthly",   monthlyList);

        long assignedSecretaries = secretaryRepository.findAll().stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("users",               usersMap);
        result.put("doctors",             doctorsMap);
        result.put("appointments",        appointmentsMap);
        result.put("assignedSecretaries", assignedSecretaries);

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}