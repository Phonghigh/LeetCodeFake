package com.leetcodefake.api_service.judge;

public record CompileResult(
    int exitcode,
    String output
) {
}
