package com.leetcodefake.api_service.problem.dto;

import com.leetcodefake.api_service.common.enums.Difficulty;
import com.leetcodefake.api_service.problem.Problem;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProblemRequestDTO {
    private String title;
    private Difficulty difficulty;
    private String description;
    private long timeLimit;
    private int memoryLimit;
}