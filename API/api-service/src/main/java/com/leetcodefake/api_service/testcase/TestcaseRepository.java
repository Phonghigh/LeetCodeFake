package com.leetcodefake.api_service.testcase;

import com.leetcodefake.api_service.common.enums.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import com.leetcodefake.api_service.problem.Problem;

public interface TestcaseRepository extends JpaRepository<Testcase, Long> {
    
    Optional<Testcase> findByProblem(Problem problem);
    Optional<List<Testcase>> findByProblemId(Long problemId);
}
