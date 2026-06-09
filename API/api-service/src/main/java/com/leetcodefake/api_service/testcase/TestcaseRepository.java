package com.leetcodefake.api_service.testcase;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.leetcodefake.api_service.problem.Problem;

public interface TestcaseRepository extends JpaRepository<Testcase, Long> {
    
    Optional<Testcase> findByProblem(Problem problem);
}
