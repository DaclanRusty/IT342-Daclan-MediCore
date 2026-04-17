package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Appointment;
import edu.cit.daclan.medicore.entity.AppointmentStatus;
import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Patient
    List<Appointment> findAllByPatient(Patient patient);
    List<Appointment> findAllByPatientAndStatusIn(Patient patient, List<AppointmentStatus> statuses);

    // Doctor
    List<Appointment> findAllByDoctor(Doctor doctor);
    List<Appointment> findAllByDoctorAndStatus(Doctor doctor, AppointmentStatus status);
    List<Appointment> findAllByDoctorAndStatusIn(Doctor doctor, List<AppointmentStatus> statuses);

    // Slot conflict check — excludes cancelled/rejected so those slots free up
    boolean existsByDoctorAndRequestedDateAndRequestedTimeAndStatusIn(
            Doctor doctor, String requestedDate, String requestedTime,
            List<AppointmentStatus> statuses);
}