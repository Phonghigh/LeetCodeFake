package com.leetcodefake.api_service.judge.result;

public record CompileResult(
    int exitcode,
    String output
) {
}
