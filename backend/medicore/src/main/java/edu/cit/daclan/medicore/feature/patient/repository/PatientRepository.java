package edu.cit.daclan.medicore.feature.patient.repository;

import edu.cit.daclan.medicore.feature.patient.entity.Patient;
import edu.cit.daclan.medicore.feature.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Find patient profile by user account
    Optional<Patient> findByUser(User user);
}
