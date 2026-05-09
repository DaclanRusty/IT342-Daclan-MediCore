package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByLicenseNumber(String licenseNumber);

    // Find doctor profile by user account
    Optional<Doctor> findByUser(User user);

    // Find all doctors by status string
    List<Doctor> findAllByStatus(String status);

    // JPQL safe version — approved doctors
    @Query("SELECT d FROM Doctor d WHERE d.status = 'APPROVED' AND d.user IS NOT NULL")
    List<Doctor> findAllApproved();

    // Approved doctors without an approved secretary
    @Query("""
        SELECT d FROM Doctor d
        WHERE d.status = 'APPROVED'
        AND d.user IS NOT NULL
        AND d.doctorId NOT IN (
            SELECT s.doctor.doctorId FROM Secretary s
            WHERE s.status = 'APPROVED'
        )
    """)
    List<Doctor> findAvailableDoctors();


    @Query("""
    SELECT d FROM Doctor d
    WHERE d.status = 'APPROVED'
    AND d.user IS NOT NULL
    AND d.doctorId IN (
        SELECT s.doctor.doctorId FROM Secretary s
        WHERE s.status = 'APPROVED'
    )
""")
    List<Doctor> findDoctorsWithApprovedSecretary();
}