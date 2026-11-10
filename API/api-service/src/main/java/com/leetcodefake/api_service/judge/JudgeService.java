package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import com.leetcodefake.api_service.problem.Problem;
import com.leetcodefake.api_service.problem.ProblemRepository;
import com.leetcodefake.api_service.submission.Submission;
import com.leetcodefake.api_service.submission.SubmissionRepository;
import com.leetcodefake.api_service.testcase.Testcase;
import com.leetcodefake.api_service.testcase.TestcaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JudgeService {
    private final SubmissionRepository submissionRepository;
    private final TestcaseRepository testcaseRepository;
    private final SandboxRunner sandboxRunner;
    private final ProblemRepository problemRepository;

    public JudgeService(SubmissionRepository submissionRepository, TestcaseRepository testcaseRepository, SandboxRunner sandboxRunner, ProblemRepository problemRepository) {
        this.submissionRepository = submissionRepository;
        this.testcaseRepository = testcaseRepository;
        this.sandboxRunner = sandboxRunner;
        this.problemRepository = problemRepository;
    }

    public SubmissionStatus judge(long SubmissionId) {
        Optional<Submission> submission = submissionRepository.findById(SubmissionId);
        if (!submission.isPresent()) {
            throw new IllegalArgumentException("Submission not found");
        }

        String code = submission.get().getSourceCode();
        Language language = submission.get().getLanguage();

        // Validate the input parameters
        if (code == null || code.isEmpty()) {
            throw new IllegalArgumentException("Code cannot be null or empty");
        }
        if (language == null) {
            throw new IllegalArgumentException("Language cannot be null or empty");
        }

        Optional<Problem> problem = problemRepository.findById(submission.get().getProblem().getId());
        if (!problem.isPresent()) {
            throw new IllegalArgumentException("Problem not found");
        }

        Optional<List<Testcase>> testCases = testcaseRepository.findInputsByProblemId(submission.get().getProblem().getId());
        if (!testCases.isPresent()) {
            throw new IllegalArgumentException("Test cases not found");
        }

        //Get time limit and memory limit from problem
        long timeLimitMs = problem.get().getTimeLimit();
        if  (timeLimitMs <= 0) {
            throw new IllegalArgumentException("Time limit must be greater than 0");
        }
        int memoryLimitBytes = problem.get().getMemoryLimit();
        if  (memoryLimitBytes <= 0) {
            throw new IllegalArgumentException("Memory limit must be greater than 0");
        }

        JudgeResult result = sandboxRunner.executionSubmission(testCases.get(), code, language, timeLimitMs, memoryLimitBytes);

        submission.get()
                .setStatus(result.submissionStatus())
                .setRuntime(result.runtime())
                .setMemory(result.memory());
        submissionRepository.save(submission.get());
        return result.submissionStatus();
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
