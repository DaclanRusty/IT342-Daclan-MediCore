package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    boolean existsByLicenseNumber(String licenseNumber);
}