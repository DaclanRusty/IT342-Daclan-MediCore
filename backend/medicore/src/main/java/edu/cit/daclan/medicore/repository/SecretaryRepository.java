package edu.cit.daclan.medicore.repository;

import edu.cit.daclan.medicore.entity.Secretary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SecretaryRepository extends JpaRepository<Secretary, UUID> {}