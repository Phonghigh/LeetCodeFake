package com.leetcodefake.api_service.testcase.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class TestcaseResponeDTO {
    private long testcaseId;
    private long problemId;
    private String input;
    private String expectedOutput;
    private boolean hidden;
    private String createdBy;
    private LocalDateTime createdAt;
}