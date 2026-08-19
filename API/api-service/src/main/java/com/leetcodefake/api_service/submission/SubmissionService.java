package com.leetcodefake.api_service.submission;

import java.util.List;

import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.problem.ProblemRepository;
import com.leetcodefake.api_service.submission.dto.SubmissionRequestDTO;
import com.leetcodefake.api_service.user.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.leetcodefake.api_service.common.exception.ResourceNotFoundException;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;

    public SubmissionService(SubmissionRepository submissionRepository, ProblemRepository problemRepository) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
    }

    public Submission findById(Long id) {
        return submissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    public List<Submission> findSubmissions(Long userId, Long problemId) {

        return submissionRepository.findSubmissions(userId, problemId);
    }

    public Submission submit(SubmissionRequestDTO dto) {

        Problem problem = problemRepository.findById(dto.getProblemId())
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Submission submission = SubmissionMapper.toEntity(dto, problem, currentUser);
        return submissionRepository.save(submission);
    }
}
