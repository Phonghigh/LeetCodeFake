package com.leetcodefake.api_service.problem;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.leetcodefake.api_service.common.enums.Difficulty;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    
    Optional<Problem> findByTitle(String title);
    Optional<Problem> findByDifficulty(Difficulty difficulty);
}
