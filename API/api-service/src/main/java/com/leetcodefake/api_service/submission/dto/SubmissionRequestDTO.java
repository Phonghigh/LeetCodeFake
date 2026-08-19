package com.leetcodefake.api_service.submission.dto;

import com.leetcodefake.api_service.common.enums.Language;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmissionRequestDTO {
    private String sourceCode;
    private Language language;
    private Long problemId;
}
