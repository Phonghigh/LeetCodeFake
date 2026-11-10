package com.leetcodefake.api_service.problem;

import com.leetcodefake.api_service.problem.dto.ProblemRequestDTO;
import com.leetcodefake.api_service.submission.Submission;
import com.leetcodefake.api_service.submission.SubmissionMapper;
import com.leetcodefake.api_service.submission.SubmissionService;
import com.leetcodefake.api_service.submission.dto.SubmissionRequestDTO;
import com.leetcodefake.api_service.submission.dto.SubmissionResponseDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import com.leetcodefake.api_service.problem.dto.ProblemResponseDTO;

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
    public ProblemResponseDTO getDetailProblem(@PathVariable Long id) {
        return problemService.findById(id);
    }

    @GetMapping
    public List<ProblemResponseDTO> getProblems() {
        return problemService.getProblems();
    }

    @PostMapping
    public ProblemResponseDTO createProblem(
            @Valid @RequestBody ProblemRequestDTO request
    ) {
        return problemService.createProblem(
            request
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

    @PutMapping("/{id}")
    public ProblemResponseDTO updateProblem(
        @PathVariable Long id,
        @Valid @RequestBody ProblemRequestDTO request
    ) {
        return problemService.updateProblem(
            id,
            request
        );
    }

    @DeleteMapping("/{id}")
    public void deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
    }
}
