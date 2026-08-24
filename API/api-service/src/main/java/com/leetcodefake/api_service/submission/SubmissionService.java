package com.leetcodefake.api_service.submission;

import java.util.List;

import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import com.leetcodefake.api_service.outboxEvent.OutboxEvent;
import com.leetcodefake.api_service.outboxEvent.OutboxEventRepository;
import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.problem.ProblemRepository;
import com.leetcodefake.api_service.submission.dto.SubmissionRequestDTO;
import com.leetcodefake.api_service.submission.dto.SubmitProblemRequest;
import com.leetcodefake.api_service.user.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.leetcodefake.api_service.common.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final OutboxEventRepository outboxEventRepository;


    public SubmissionService(SubmissionRepository submissionRepository, ProblemRepository problemRepository, OutboxEventRepository outboxEventRepository) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.outboxEventRepository = outboxEventRepository;
    }

    public Submission findById(Long id) {
        return submissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    public List<Submission> findSubmissions(Long userId, Long problemId) {

        return submissionRepository.findSubmissions(userId, problemId);
    }

    @Transactional
    public Submission submit(long id, SubmissionRequestDTO dto) {

        Problem problem = problemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Submission submission = SubmissionMapper.toEntity(dto, problem, currentUser);
        submission.setStatus(SubmissionStatus.PENDING);
        submissionRepository.save(submission);
        outboxEventRepository.save(new OutboxEvent(submission));
        return submission;
    }
}
