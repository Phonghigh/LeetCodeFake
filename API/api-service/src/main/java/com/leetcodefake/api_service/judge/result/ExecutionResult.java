package com.leetcodefake.api_service.judge.result;

import com.leetcodefake.api_service.common.enums.RunResult;

public record ExecutionResult(
    boolean success,
    String output,
    int exitcode,
    long durationMs,
    int memoryBytes,
    RunResult runResult
) {
}
