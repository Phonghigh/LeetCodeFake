package com.leetcodefake.api_service.problem.dto;

import java.time.LocalDateTime;

import com.leetcodefake.api_service.common.enums.Difficulty;
import com.leetcodefake.api_service.problem.Problem;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProblemResponseDTO {
    private Long id;
    private String title;
    private Difficulty difficulty;
    private String description;
    private long timeLimit;
    private int memoryLimit;
    private LocalDateTime createdAt;
}