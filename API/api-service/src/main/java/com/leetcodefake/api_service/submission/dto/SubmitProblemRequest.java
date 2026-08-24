package com.leetcodefake.api_service.submission.dto;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class SubmitProblemRequest {
    private String sourceCode;
    private Language language;
}


