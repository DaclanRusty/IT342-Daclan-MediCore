package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    boolean existsByLicenseNumber(String licenseNumber);
    Optional<Doctor> findByUser(User user);
    List<Doctor> findAllByStatus(String status);

    // Returns approved doctors who do NOT yet have an APPROVED secretary
    @Query("""
        SELECT d FROM Doctor d
        WHERE d.status = 'APPROVED'
        AND d.doctorId NOT IN (
            SELECT s.doctor.doctorId FROM Secretary s
            WHERE s.status = 'APPROVED'
        )
    """)
    List<Doctor> findAvailableDoctors();
}