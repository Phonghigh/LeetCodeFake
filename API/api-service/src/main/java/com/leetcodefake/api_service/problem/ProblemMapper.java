package com.leetcodefake.api_service.problem;

import com.leetcodefake.api_service.problem.dto.ProblemRequestDTO;
import com.leetcodefake.api_service.problem.dto.ProblemResponseDTO;
import com.leetcodefake.api_service.user.User;

public class ProblemMapper {
    public static ProblemResponseDTO toDTO(Problem problem) {
        ProblemResponseDTO dto = new ProblemResponseDTO();
        dto.setId(problem.getId());
        dto.setTitle(problem.getTitle());
        dto.setDifficulty(problem.getDifficulty());
        dto.setDescription(problem.getDescription());
        dto.setTimeLimit(problem.getTimeLimit());
        dto.setMemoryLimit(problem.getMemoryLimit());
        dto.setCreatedAt(problem.getCreatedAt());
        return dto;
    }

    public static Problem toEntity(ProblemRequestDTO requestDTO, User user) {
        Problem pro = new Problem();
        pro.setTitle(requestDTO.getTitle());
        pro.setDifficulty(requestDTO.getDifficulty());
        pro.setDescription(requestDTO.getDescription());
        pro.setTimeLimit(requestDTO.getTimeLimit());
        pro.setMemoryLimit(requestDTO.getMemoryLimit());
        pro.setCreatedBy(user.getEmail());
        pro.setUpdatedBy(user.getEmail());
        return pro;
    }
}
