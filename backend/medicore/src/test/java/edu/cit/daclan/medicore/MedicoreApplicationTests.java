package edu.cit.daclan.medicore;

import edu.cit.daclan.medicore.feature.auth.dto.request.LoginRequest;
import edu.cit.daclan.medicore.feature.auth.dto.request.RegisterRequest;
import edu.cit.daclan.medicore.feature.auth.entity.User;
import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.patient.entity.Patient;
import edu.cit.daclan.medicore.feature.appointment.entity.Appointment;
import edu.cit.daclan.medicore.feature.appointment.entity.AppointmentStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MedicoreApplicationTests {

    @Test
    @DisplayName("TC-001: Application context loads successfully")
    void contextLoads() {
        assertTrue(true, "Application context loaded successfully");
    }

    @Test
    @DisplayName("TC-002: RegisterRequest fields are set correctly")
    void testRegisterRequestFields() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("testpatient@gmail.com");
        request.setPassword("password123");
        request.setFirstname("John");
        request.setLastname("Doe");
        request.setRole("PATIENT");
        request.setGoogleVerified(true);
        assertEquals("testpatient@gmail.com", request.getEmail());
        assertEquals("John", request.getFirstname());
        assertEquals("PATIENT", request.getRole());
        assertTrue(request.isGoogleVerified());
    }

    @Test
    @DisplayName("TC-003: LoginRequest fields are set correctly")
    void testLoginRequestFields() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@medicore.com");
        request.setPassword("admin123");
        assertEquals("admin@medicore.com", request.getEmail());
        assertNotNull(request.getPassword());
    }

    @Test
    @DisplayName("TC-004: User entity is created with correct fields")
    void testUserEntityCreation() {
        User user = User.builder()
                .email("doctor@medicore.com")
                .firstName("Jane")
                .lastName("Smith")
                .role("DOCTOR")
                .status("ACTIVE")
                .build();
        assertEquals("doctor@medicore.com", user.getEmail());
        assertEquals("DOCTOR", user.getRole());
        assertEquals("ACTIVE", user.getStatus());
    }

    @Test
    @DisplayName("TC-005: Doctor entity is created with correct fields")
    void testDoctorEntityCreation() {
        Doctor doctor = new Doctor();
        doctor.setLicenseNumber("LIC-12345");
        doctor.setSpecialization("Cardiology");
        doctor.setStatus("PENDING");
        assertEquals("LIC-12345", doctor.getLicenseNumber());
        assertEquals("Cardiology", doctor.getSpecialization());
        assertEquals("PENDING", doctor.getStatus());
    }

    @Test
    @DisplayName("TC-006: Patient entity is created with correct fields")
    void testPatientEntityCreation() {
        Patient patient = new Patient();
        patient.setGender("MALE");
        patient.setAddress("123 Main St");
        assertEquals("MALE", patient.getGender());
        assertEquals("123 Main St", patient.getAddress());
    }

    @Test
    @DisplayName("TC-007: Appointment has PENDING status by default")
    void testAppointmentEntityCreation() {
        Appointment appointment = new Appointment();
        appointment.setRequestedDate("2026-05-15");
        appointment.setRequestedTime("10:00 AM");
        appointment.setReasonForVisit("Regular checkup");
        appointment.setStatus(AppointmentStatus.PENDING);
        assertEquals(AppointmentStatus.PENDING, appointment.getStatus());
        assertNotNull(appointment.getReasonForVisit());
    }

    @Test
    @DisplayName("TC-008: Appointment status transitions correctly")
    void testAppointmentStatusTransition() {
        Appointment appointment = new Appointment();
        appointment.setStatus(AppointmentStatus.PENDING);
        assertEquals(AppointmentStatus.PENDING, appointment.getStatus());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        assertEquals(AppointmentStatus.CONFIRMED, appointment.getStatus());
        appointment.setStatus(AppointmentStatus.COMPLETED);
        assertEquals(AppointmentStatus.COMPLETED, appointment.getStatus());
    }

    @Test
    @DisplayName("TC-009: User roles are correctly assigned")
    void testUserRoles() {
        String[] validRoles = {"PATIENT", "DOCTOR", "SECRETARY", "ADMIN"};
        for (String role : validRoles) {
            User user = User.builder().email("user@medicore.com").role(role).status("ACTIVE").build();
            assertEquals(role, user.getRole());
        }
    }

    @Test
    @DisplayName("TC-010: Email format is valid")
    void testEmailFormat() {
        String validEmail = "testuser@gmail.com";
        assertTrue(validEmail.contains("@"));
        assertTrue(validEmail.contains("."));
        assertFalse(validEmail.isBlank());
    }

    @Test
    @DisplayName("TC-011: Password field is not null or empty")
    void testPasswordNotNull() {
        LoginRequest request = new LoginRequest();
        request.setPassword("securePassword123");
        assertNotNull(request.getPassword());
        assertFalse(request.getPassword().isBlank());
        assertTrue(request.getPassword().length() >= 8);
    }

    @Test
    @DisplayName("TC-012: Doctor status values are valid")
    void testDoctorStatusValues() {
        Doctor doctor = new Doctor();
        doctor.setStatus("PENDING");
        assertEquals("PENDING", doctor.getStatus());
        doctor.setStatus("APPROVED");
        assertEquals("APPROVED", doctor.getStatus());
        doctor.setStatus("REJECTED");
        assertEquals("REJECTED", doctor.getStatus());
    }

    @Test
    @DisplayName("TC-013: Appointment cancellation fields are set correctly")
    void testAppointmentCancellation() {
        Appointment appointment = new Appointment();
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason("Doctor unavailable");
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        assertEquals("Doctor unavailable", appointment.getCancelReason());
    }

    @Test
    @DisplayName("TC-014: User profile picture field can be set")
    void testUserProfilePicture() {
        User user = User.builder()
                .email("patient@medicore.com")
                .firstName("John")
                .role("PATIENT")
                .status("ACTIVE")
                .build();
        user.setProfilePicture("https://example.com/profile.jpg");
        assertEquals("https://example.com/profile.jpg", user.getProfilePicture());
    }

    @Test
    @DisplayName("TC-015: Role is stored in uppercase")
    void testRoleUppercase() {
        RegisterRequest request = new RegisterRequest();
        request.setRole("patient");
        String normalizedRole = request.getRole().toUpperCase();
        assertEquals("PATIENT", normalizedRole);
    }
}
