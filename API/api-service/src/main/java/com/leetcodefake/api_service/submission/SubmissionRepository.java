package com.leetcodefake.api_service.submission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    @Query("""
        SELECT s FROM Submission s
        WHERE (:user_id IS NULL OR s.user.id = :user_id)
        AND (:problem_id IS NULL OR s.problem.id = :problem_id)
        """)
    List<Submission> findSubmissions(
        @Param("user_id") Long userId, 
        @Param("problem_id") Long problemId
    );
}
