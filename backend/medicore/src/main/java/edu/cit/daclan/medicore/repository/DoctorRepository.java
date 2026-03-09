package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    boolean existsByLicenseNumber(String licenseNumber);
    Optional<Doctor> findByUser(User user);
    List<Doctor> findAllByStatus(String status);   // ← add this
}