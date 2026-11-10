package com.leetcodefake.api_service.testcase;

import com.leetcodefake.api_service.testcase.dto.TestcaseRequestDTO;
import com.leetcodefake.api_service.testcase.dto.TestcaseResponeDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.contextPath}/testcases")
public class TestcaseController {
    private final TestcaseService testcaseService;

    public TestcaseController(TestcaseService testcaseService) {
        this.testcaseService = testcaseService;
    }

    @GetMapping
    public List<TestcaseResponeDTO> getAllTestcases(
            @RequestParam(required = false) long problemId
    ) {
        return testcaseService.findAll(problemId);
    }

    @GetMapping("/{testcaseId}")
    public TestcaseResponeDTO getDetailTestcases(
            @PathVariable Long testcaseId
    ) {
        return testcaseService.findTestcaseById(testcaseId);
    }

    @PostMapping("/{problemId}")
    public TestcaseResponeDTO createTestcase(
            @PathVariable Long problemId,
            @Valid @RequestBody TestcaseRequestDTO request
    ) {
        TestcaseResponeDTO testcase = testcaseService.createTestcase(request, problemId);
        return testcase;
    }

    @PutMapping("/{testcaseId}")
    public TestcaseResponeDTO updateTestcase(
            @PathVariable Long testcaseId,
            @Valid @RequestBody TestcaseRequestDTO request
    ) {
        TestcaseResponeDTO testcase = testcaseService.updateTestcase(testcaseId, request);
        return testcase;
    }

    @DeleteMapping("/{testcaseId}")
    public void deleteTestcase(
            @PathVariable Long testcaseId
    ) {
        testcaseService.deleteTestcase(testcaseId);
    }
}
