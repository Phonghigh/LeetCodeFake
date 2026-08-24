package com.leetcodefake.api_service.problem;

import com.leetcodefake.api_service.submission.Submission;
import com.leetcodefake.api_service.submission.SubmissionMapper;
import com.leetcodefake.api_service.submission.SubmissionService;
import com.leetcodefake.api_service.submission.dto.SubmissionRequestDTO;
import com.leetcodefake.api_service.submission.dto.SubmissionResponseDTO;
import com.leetcodefake.api_service.submission.dto.SubmitProblemRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RestController;

import com.leetcodefake.api_service.problem.dto.ProblemResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("${api.contextPath}/problems")
public class ProblemController {

    
    private final ProblemService problemService;
    private final SubmissionService submissionService;
    public ProblemController(ProblemService problemService, SubmissionService submissionService) {
        this.problemService = problemService;
        this.submissionService = submissionService;
    }

    @GetMapping("/{id}")
    public ProblemResponse getDetailProblem(@PathVariable Long id) {
        return problemService.findById(id);
    }

    @GetMapping
    public List<ProblemResponse> getProblems() {
        return problemService.getProblems();
    }

    @PostMapping
    public ProblemResponse createProblem(
        @Valid @RequestBody CreateProblemRequest request
    ) {
        return problemService.createProblem(
            request.title(),
            request.description(),
            request.constraints(),
            request.difficulty()
        );
    }

    @PostMapping("/{problemId}/submit")
    public SubmissionResponseDTO submitProblem(
        @PathVariable Long problemId,
        @Valid @RequestBody SubmissionRequestDTO request
    ) {
        Submission submission = submissionService.submit(problemId, request);
        return SubmissionMapper.toDTO(submission);
    }
}
