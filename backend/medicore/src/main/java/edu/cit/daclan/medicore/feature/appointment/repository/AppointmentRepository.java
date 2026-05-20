package edu.cit.daclan.medicore.feature.appointment.repository;


import edu.cit.daclan.medicore.feature.appointment.entity.Appointment;
import edu.cit.daclan.medicore.feature.appointment.entity.AppointmentStatus;
import edu.cit.daclan.medicore.feature.doctor.entity.Doctor;
import edu.cit.daclan.medicore.feature.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Patient
    List<Appointment> findAllByPatient(Patient patient);
    List<Appointment> findAllByPatientAndStatusIn(Patient patient, List<AppointmentStatus> statuses);
    List<Appointment> findAllByStatus(AppointmentStatus status);

    // Doctor
    List<Appointment> findAllByDoctor(Doctor doctor);
    List<Appointment> findAllByDoctorAndStatus(Doctor doctor, AppointmentStatus status);
    List<Appointment> findAllByDoctorAndStatusIn(Doctor doctor, List<AppointmentStatus> statuses);

    // Slot conflict check — excludes cancelled/rejected so those slots free up
    boolean existsByDoctorAndRequestedDateAndRequestedTimeAndStatusIn(
            Doctor doctor, String requestedDate, String requestedTime,
            List<AppointmentStatus> statuses);
}
