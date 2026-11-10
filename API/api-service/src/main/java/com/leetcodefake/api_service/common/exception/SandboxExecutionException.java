package com.leetcodefake.api_service.common.exception;

public class SandboxExecutionException extends RuntimeException {
    public SandboxExecutionException(String message, Throwable e) {
        super(message, e);
    }
}
