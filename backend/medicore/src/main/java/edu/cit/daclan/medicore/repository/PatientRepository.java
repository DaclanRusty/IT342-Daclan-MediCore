package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {}