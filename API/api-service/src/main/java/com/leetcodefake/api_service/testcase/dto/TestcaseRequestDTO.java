package com.leetcodefake.api_service.testcase.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TestcaseRequestDTO {
    private String input;
    private String expectedOutput;
    private boolean hidden;
}