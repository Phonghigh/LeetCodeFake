package com.leetcodefake.api_service.judge.execution;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import com.leetcodefake.api_service.common.exception.SandboxExecutionException;
import com.leetcodefake.api_service.judge.execution.language.LanguageRunner;
import com.leetcodefake.api_service.judge.execution.language.LanguageRunnerFactory;
import com.leetcodefake.api_service.judge.execution.process.WorkingDir;
import com.leetcodefake.api_service.judge.result.CompileResult;
import com.leetcodefake.api_service.judge.result.ExecutionResult;
import com.leetcodefake.api_service.judge.result.JudgeResult;
import com.leetcodefake.api_service.testcase.Testcase;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static java.lang.Long.max;
import static java.lang.Integer.max;

@Service
public class SandboxRunner {
    private final LanguageRunnerFactory factory;

    public SandboxRunner(LanguageRunnerFactory factory) {
        this.factory = factory;
    }

    public JudgeResult executionSubmission(List<Testcase> testcases, String code, Language language, long timeLimitMs, int memoryLimitBytes) {
        LanguageRunner runner = factory.createLanguageRunner(language, timeLimitMs, memoryLimitBytes);
        long timeExcecutionTestcase = 0;
        int memoryUsage = 0;
        try (WorkingDir workingDir = new WorkingDir(Files.createTempDirectory("submission"))) {
            Path workingDirPath = workingDir.getPath();

            runner.prepareResources(code, workingDir.getPath());

            CompileResult compileResult = runner.compile(workingDirPath);
            if (compileResult.exitcode() != 0) {
                JudgeResult judgeResult = new JudgeResult(
                        false,
                        compileResult.exitcode(),
                        0,
                        0,
                        SubmissionStatus.COMPILE_ERROR);
                return judgeResult;
            }

            for (Testcase testcase : testcases) {

                ExecutionResult result = runner.run(
                        testcase.getInput(),
                        workingDirPath);
                timeExcecutionTestcase = max(timeExcecutionTestcase, result.durationMs());
                memoryUsage = max(memoryUsage, result.memoryBytes());
                if (!result.success()) {
                    SubmissionStatus submissionStatus = null;
                    switch (result.runResult()) {
                        case TIME_LIMIT_EXCEEDED -> {
                            submissionStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
                        }
                        case MEMORY_LIMIT_EXCEEDED -> {
                            submissionStatus = SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
                        }
                        case RUNTIME_ERROR -> {
                            submissionStatus = SubmissionStatus.RUNTIME_ERROR;
                        }
                        case COMPILE_ERROR -> {
                            submissionStatus = SubmissionStatus.COMPILE_ERROR;
                        }
                    }
                    JudgeResult judgeResult = new JudgeResult(
                            false,
                            result.exitcode(),
                            timeExcecutionTestcase,
                            memoryUsage,
                            submissionStatus);
                    return judgeResult;
                }

                // Compare Output
                if (!compareOutput(result.output(), testcase.getExpectedOutput())){
                    JudgeResult judgeResult = new JudgeResult(
                            false,
                            0,
                            timeExcecutionTestcase,
                            memoryUsage,
                            SubmissionStatus.WRONG_ANSWER
                    );
                    return judgeResult;
                }
            }
        } catch (IOException e) {
            throw new SandboxExecutionException("Error occurred while preparing resources", e);
        } catch (Exception e) {
            throw new SandboxExecutionException("Error occurred while executing submission", e);
        }

        JudgeResult judgeResult = new JudgeResult(
                true,
                                0,
                timeExcecutionTestcase,
                memoryUsage,
                SubmissionStatus.ACCEPTED);
        return judgeResult;
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
