package com.leetcodefake.api_service.submission.dto;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class SubmissionResponseDTO {
    private Long id;
    private String sourceCode;
    private Language language;
    private int runtime;
    private int memory;
    private SubmissionStatus submissionStatus;
    private String createdBy;
    private LocalDateTime createdAt;
}


