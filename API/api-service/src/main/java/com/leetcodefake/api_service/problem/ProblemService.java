package com.leetcodefake.api_service.problem;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.leetcodefake.api_service.common.exception.ResourceNotFoundException;
import com.leetcodefake.api_service.common.enums.Difficulty;
import com.leetcodefake.api_service.problem.dto.ProblemResponse;

@Service
public class ProblemService {
    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public ProblemResponse findById(Long id) {
        Problem problem = problemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        return ProblemResponse.from(problem);
    }

    public List<ProblemResponse> getProblems() {
        List<ProblemResponse> problems =  problemRepository.findAll().stream()
            .map(ProblemResponse::from)
            .collect(Collectors.toList());
        
        return problems;
    }

    public ProblemResponse createProblem(
        String title,
        String description,
        String constraints,
        Difficulty difficulty
    ) {
        
        Problem problem = 
            Problem.builder()
                .title(title)
                .description(description)
                .constraints(constraints)
                .difficulty(difficulty)
                .build();
        
        problemRepository.save(problem);
        return ProblemResponse.from(problem);
    }
}
