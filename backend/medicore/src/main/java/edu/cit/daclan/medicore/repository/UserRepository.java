package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (used in JWT auth)
    Optional<User> findByEmail(String email);

    // Check if an email already exists
    boolean existsByEmail(String email);
}