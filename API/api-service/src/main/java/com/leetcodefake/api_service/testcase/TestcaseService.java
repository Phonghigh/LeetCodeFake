package com.leetcodefake.api_service.testcase;

import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.problem.ProblemRepository;
import com.leetcodefake.api_service.testcase.dto.TestcaseRequestDTO;
import com.leetcodefake.api_service.testcase.dto.TestcaseResponeDTO;
import com.leetcodefake.api_service.user.User;
import jakarta.persistence.EntityManager;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static org.springframework.data.projection.EntityProjection.ProjectionType.DTO;

@Service
public class TestcaseService {
    private final TestcaseRepository testcaseRepository;
    private final ProblemRepository problemRepository;

    public TestcaseService(TestcaseRepository testcaseRepository, ProblemRepository problemRepository) {
        this.testcaseRepository = testcaseRepository;
        this.problemRepository = problemRepository;
    }

    public TestcaseResponeDTO findTestcaseById(Long testcaseId) {
        Testcase testcase = testcaseRepository.findById(testcaseId).orElseThrow(
                () -> new RuntimeException("Testcase not found for testcaseId: " + testcaseId)
        );
        return TestcaseMapper.toDTO(testcase);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public TestcaseResponeDTO createTestcase(
            TestcaseRequestDTO testcaseRequestDTO,
            Long problemId
    ) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Get the problem reference
        Problem problemRef =  problemRepository.getReferenceById(problemId);
        Testcase testcase = TestcaseMapper.toEnity(testcaseRequestDTO, problemRef, currentUser);
        testcaseRepository.save(testcase);
        return TestcaseMapper.toDTO(testcase);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public TestcaseResponeDTO updateTestcase(Long testcaseId, TestcaseRequestDTO testcaseRequestDTO) {
        Testcase testcase = testcaseRepository.findById(testcaseId).orElseThrow(() -> new RuntimeException("Testcase not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (testcaseRequestDTO.getInput() != null) {
            testcase.setInput(testcaseRequestDTO.getInput());
        }
        if (testcaseRequestDTO.getExpectedOutput() != null) {
            testcase.setExpectedOutput(testcaseRequestDTO.getExpectedOutput());
        }
        testcase.setHidden(testcaseRequestDTO.isHidden());

        testcaseRepository.save(testcase);
        return TestcaseMapper.toDTO(testcase);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTestcase(Long testcaseId) {
        testcaseRepository.deleteById(testcaseId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<TestcaseResponeDTO> findAll(
            long problemId
    ) {
        return testcaseRepository.findAll().stream().filter(t -> t.getProblem().getId() == problemId).map(TestcaseMapper::toDTO).toList();
    }
}
