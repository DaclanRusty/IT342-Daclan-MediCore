package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Appointment;
import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Find all appointments for a given patient
    List<Appointment> findAllByPatient(Patient patient);

    // Find all appointments for a doctor with a specific status (e.g., APPROVED)
    List<Appointment> findAllByDoctorAndStatus(Doctor doctor, String status);

    // Find all pending appointments for a doctor (used by secretary)
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.status = 'PENDING'")
    List<Appointment> findPendingByDoctor(Doctor doctor);

    // Check if a doctor already has an appointment at a specific date and time
    boolean existsByDoctorAndRequestedDateAndRequestedTime(
            Doctor doctor, String requestedDate, String requestedTime);
}