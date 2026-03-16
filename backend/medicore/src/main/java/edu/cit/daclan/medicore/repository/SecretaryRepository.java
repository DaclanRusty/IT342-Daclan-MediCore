package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Doctor;
import edu.cit.daclan.medicore.entity.Secretary;
import edu.cit.daclan.medicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SecretaryRepository extends JpaRepository<Secretary, Long> {

    // Find all secretaries pending approval for a specific doctor
    List<Secretary> findByDoctorAndStatus(Doctor doctor, String status);

    // Find all secretaries assigned to a specific doctor
    List<Secretary> findByDoctor(Doctor doctor);

    // Find secretary by their user account
    Optional<Secretary> findByUser(User user);
}