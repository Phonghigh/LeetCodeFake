package com.leetcodefake.api_service.testcase;

import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.testcase.dto.TestcaseRequestDTO;
import com.leetcodefake.api_service.testcase.dto.TestcaseResponeDTO;
import com.leetcodefake.api_service.user.User;

public class TestcaseMapper {
    public static TestcaseResponeDTO toDTO(
            Testcase testcase
    ){
        TestcaseResponeDTO dto = new TestcaseResponeDTO();
        dto.setTestcaseId(testcase.getId());
        dto.setProblemId(testcase.getProblem().getId());
        dto.setInput(testcase.getInput());
        dto.setExpectedOutput(testcase.getExpectedOutput());
        dto.setHidden(testcase.getHidden());
        dto.setCreatedAt(testcase.getCreatedAt());
        dto.setCreatedBy(testcase.getCreatedBy());
        return dto;
    }

    public static Testcase toEnity (TestcaseRequestDTO testcaseRequestDTO, Problem problem, User user){
        Testcase testcase = new Testcase();
        testcase.setInput(testcaseRequestDTO.getInput());
        testcase.setExpectedOutput(testcaseRequestDTO.getExpectedOutput());
        testcase.setHidden(testcaseRequestDTO.isHidden());
        testcase.setCreatedBy(user.getEmail());
        testcase.setUpdatedBy(user.getEmail());
        testcase.setProblem(problem);
        return testcase;
    }
}
