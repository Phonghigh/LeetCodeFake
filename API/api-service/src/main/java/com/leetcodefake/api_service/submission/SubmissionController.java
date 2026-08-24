package com.leetcodefake.api_service.submission;

import java.util.List;
import java.util.stream.Collectors;

import com.leetcodefake.api_service.submission.dto.SubmissionResponseDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("${api.contextPath}/submissions")
public class SubmissionController {
    
    private final SubmissionService submissionService;
    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping()
    public List<SubmissionResponseDTO> getSubmissions(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) Long problemId    
    ) {
        List<Submission> submissions = submissionService.findSubmissions(userId, problemId);
        return submissions.stream()
                .map(SubmissionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public SubmissionResponseDTO getSubmission(@PathVariable Long id) {
        Submission submission = submissionService.findById(id);
        return SubmissionMapper.toDTO(submission);
    }
}
