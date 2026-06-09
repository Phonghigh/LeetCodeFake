package com.leetcodefake.api_service.submission;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.leetcodefake.api_service.user.User;
import com.leetcodefake.api_service.problem.Problem;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    Optional<Submission> findByUserAndProblem(User user, Problem problem);
}
