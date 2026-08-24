package com.leetcodefake.api_service.submission;

import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.submission.dto.SubmissionRequestDTO;
import com.leetcodefake.api_service.submission.dto.SubmissionResponseDTO;
import com.leetcodefake.api_service.submission.dto.SubmitProblemRequest;
import com.leetcodefake.api_service.user.User;

public class SubmissionMapper {
    public static SubmissionResponseDTO toDTO(Submission submission) {
        SubmissionResponseDTO dto = new SubmissionResponseDTO();
        dto.setId(submission.getId());
        dto.setSourceCode(submission.getSourceCode());
        dto.setLanguage(submission.getLanguage());
        dto.setRuntime(submission.getRuntime());
        dto.setMemory(submission.getMemory());
        dto.setSubmissionStatus(submission.getStatus());
        dto.setCreatedBy(submission.getCreatedBy());
        dto.setCreatedAt(submission.getCreatedAt());
        return dto;
    }

    public static Submission toEntity(SubmissionRequestDTO requestDTO, Problem problem, User user) {
        Submission submission = new Submission();
        submission.setSourceCode(requestDTO.getSourceCode());
        submission.setLanguage(requestDTO.getLanguage());
        submission.setProblem(problem);
        submission.setUser(user);
        submission.setCreatedBy(user.getUsername());
        submission.setUpdatedBy(user.getUsername());
        return submission;
    }
}
