package com.leetcodefake.api_service.testcase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import com.leetcodefake.api_service.problem.Problem;

public interface TestcaseRepository extends JpaRepository<Testcase, Long> {
    
    Optional<Testcase> findByProblem(Problem problem);
    Optional<List<Testcase>> findByProblemId(Long problemId);
    Optional<List<Testcase>> findInputsByProblemId(Long problemId);
}
