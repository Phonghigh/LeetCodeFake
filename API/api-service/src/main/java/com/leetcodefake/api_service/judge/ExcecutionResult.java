package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.TerminationReason;

public record ExcecutionResult(
    boolean success,
    String output,
    int exitcode,
    long durationMs,
    long memoryBytes,
    TerminationReason terminationReason
) {
}
