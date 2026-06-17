package com.leetcodefake.api_service.problem;

import org.springframework.web.bind.annotation.RestController;

import com.leetcodefake.api_service.problem.dto.ProblemResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("api/v1/problems")
public class ProblemController {

    
    private final ProblemService problemService;
    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping("/{id}")
    public ProblemResponse getDetailProblem(@PathVariable Long id) {
        return problemService.findById(id);
    }

    @GetMapping
    public List<ProblemResponse> getProblems() {
        return problemService.getProblems();
    }

    @PostMapping
    public ProblemResponse createProblem(
        @RequestBody CreateProblemRequest request
    ) {
        return problemService.createProblem(
            request.title(),
            request.description(),
            request.constraints(),
            request.difficulty()
        );
    }
    
    
}
