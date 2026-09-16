package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.problem.ProblemRepository;
import com.leetcodefake.api_service.submission.Submission;
import com.leetcodefake.api_service.submission.SubmissionRepository;
import com.leetcodefake.api_service.testcase.Testcase;
import com.leetcodefake.api_service.testcase.TestcaseRepository;

import java.util.List;
import java.util.Optional;

public class JudgeService {
    private final JudgeWorker judgeWorker;
    private final SubmissionRepository submissionRepository;
    private final TestcaseRepository testcaseRepository;

    public JudgeService(JudgeWorker judgeWorker, SubmissionRepository submissionRepository, TestcaseRepository testcaseRepository) {
        this.judgeWorker = judgeWorker;
        this.submissionRepository = submissionRepository;
        this.testcaseRepository = testcaseRepository;
    }

    public SubmissionStatus judge(long SubmissionId) {
        Optional<Submission> submission = submissionRepository.findById(SubmissionId);
        if (!submission.isPresent()) {
            throw new IllegalArgumentException("Submission not found");
        }

        String code = submission.get().getSourceCode();
        String language = submission.get().getLanguage().name();

        // Validate the input parameters
        if (code == null || code.isEmpty()) {
            throw new IllegalArgumentException("Code cannot be null or empty");
        }
        if (language == null || language.isEmpty()) {
            throw new IllegalArgumentException("Language cannot be null or empty");
        }

        // Compile the code and check for compilation errors
//        boolean isCompile = SanboxRunner.compile(code, language);
//        if (!isCompile) {
//            return SubmissionStatus.COMPILE_ERROR;
//        }

        // Get the test cases for the problem
        Problem problem = submission.get().getProblem();
        Optional<List<Testcase>> testcases = testcaseRepository.findByProblemId(problem.getId());
        if (!testcases.isPresent()) {
            throw new IllegalArgumentException("Test cases not found for the problem");
        }

        List<Testcase> testcaseList = testcases.get();
        // Run the code with each test case and collect the results
        for (Testcase testcase : testcaseList) {

//            ExcecutionResult result = SanboxRunner.run(code, language, testcase.getInput());
//
//
//            String expectedOutput = testcase.getExpectedOutput();
//            String actualOutput = result.output();
//
//            try {
//                if (!compareOutput(actualOutput, expectedOutput)) {
//                    return SubmissionStatus.WRONG_ANSWER;
//                }
//            }
//            catch (Exception e) {
//                throw new RuntimeException("Error occurred while comparing outputs", e);
//            }
        }
        submission.get().setStatus(SubmissionStatus.ACCEPTED);
        submissionRepository.save(submission.get());
        return SubmissionStatus.ACCEPTED;
    }

    private String normalizeOutput(String output) {
        // CRLF -> LF
        output = output.replace("\r\n", "\n");
        // CR -> LF
        output = output.replace("\r", "\n");
        // Remove trailing whitespace
        output = output.replaceFirst("\\s+$", "");

        return output;
    }

    private boolean compareOutput(String actualOutput, String expectedOutput) {

        //validate the input parameters
        if (actualOutput == null) {
            throw new IllegalArgumentException("Output cannot be null");
        }
        if (expectedOutput == null) {
            throw new IllegalArgumentException("Expected output cannot be null");
        }
        // Normalize the outputs
        String normalizedActualOutput = normalizeOutput(actualOutput);
        String normalizedExpectedOutput = normalizeOutput(expectedOutput);

        // Compare the normalized outputs
        return normalizedActualOutput.equals(normalizedExpectedOutput);
    }
}
