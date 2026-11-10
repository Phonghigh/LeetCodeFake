package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.SubmissionStatus;

public record JudgeResult(
    boolean success,
    int exitcode,
    long runtime,
    int memory,
    SubmissionStatus submissionStatus
) {
}
