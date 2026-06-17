package com.leetcodefake.api_service.problem;

import com.leetcodefake.api_service.common.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateProblemRequest(
    @NotBlank String title,
    @NotBlank String description,
    String constraints, // Optional field
    @NotNull Difficulty difficulty
) {
}
