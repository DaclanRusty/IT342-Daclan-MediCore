package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Appointment;
import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;  // ← ADD THIS

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findAllByPatient(Patient patient);

    List<Appointment> findAllByDoctorAndStatus(Doctor doctor, String status);

    // ↓ Added @Param — this was causing the runtime error
    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.status = 'PENDING'")
    List<Appointment> findPendingByDoctor(@Param("doctor") Doctor doctor);

    // ↓ Also add this — secretary needs to see ALL statuses to manage them
    List<Appointment> findAllByDoctor(Doctor doctor);

    boolean existsByDoctorAndRequestedDateAndRequestedTime(
            Doctor doctor, String requestedDate, String requestedTime);
}