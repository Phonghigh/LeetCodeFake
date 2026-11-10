package com.leetcodefake.api_service.problem;

import java.util.List;
import java.util.stream.Collectors;

import com.leetcodefake.api_service.problem.dto.ProblemRequestDTO;
import com.leetcodefake.api_service.user.User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.leetcodefake.api_service.common.exception.ResourceNotFoundException;
import com.leetcodefake.api_service.common.enums.Difficulty;
import com.leetcodefake.api_service.problem.dto.ProblemResponseDTO;

@Service
public class ProblemService {
    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public ProblemResponseDTO findById(Long id) {
        Problem problem = problemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        return ProblemMapper.toDTO(problem);
    }

    public List<ProblemResponseDTO> getProblems() {
        List<ProblemResponseDTO> problems =  problemRepository.findAll().stream()
            .map(ProblemMapper::toDTO)
            .collect(Collectors.toList());
        
        return problems;
    }

    @PreAuthorize("hasRole('ADMIN')") //only User has role Admin can use this service
    public ProblemResponseDTO createProblem(
        ProblemRequestDTO requestDTO
    ) {
        //
        User currentUser = (User) SecurityContextHolder.getContext()
            .getAuthentication()
            .getPrincipal();
        
        Problem problem = ProblemMapper.toEntity(requestDTO, currentUser);
        problemRepository.save(problem);
        return ProblemMapper.toDTO(problem);
    }

    @PreAuthorize("hasRole('ADMIN')") //only User has role Admin can use this service
    public ProblemResponseDTO updateProblem(
        long problemId,
        ProblemRequestDTO requestDTO
    ) {
        Problem problem = problemRepository.findById(problemId)
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        problem.setTitle(requestDTO.getTitle())
            .setDifficulty(requestDTO.getDifficulty())
            .setDescription(requestDTO.getDescription())
            .setTimeLimit(requestDTO.getTimeLimit())
            .setMemoryLimit(requestDTO.getMemoryLimit());
        problemRepository.save(problem);
        return ProblemMapper.toDTO(problem);
    }

    @PreAuthorize("hasRole('ADMIN')") //only User has role Admin can use this service
    public void deleteProblem(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        problemRepository.delete(problem);
    }
}
