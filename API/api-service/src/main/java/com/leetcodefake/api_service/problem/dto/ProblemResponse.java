package com.leetcodefake.api_service.problem.dto;

import java.time.LocalDateTime;

import com.leetcodefake.api_service.common.enums.Difficulty;
import com.leetcodefake.api_service.problem.Problem;

public record ProblemResponse(
    Long id,
    String title,
    Difficulty difficulty,
    String description,
    String constraints,
    LocalDateTime createdAt
)
    {
        public static ProblemResponse from(Problem problem){
            return new ProblemResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getDifficulty(),
                problem.getDescription(),
                problem.getConstraints(),
                problem.getCreatedAt()
            );
        }
    }
