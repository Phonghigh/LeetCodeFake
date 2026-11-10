package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import com.leetcodefake.api_service.common.exception.SandboxExecutionException;
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

            runner.compile(workingDirPath);

            for (Testcase testcase : testcases) {

                ExecutionResult result = runner.run(
                        testcase.getInput(),
                        testcase.getExpectedOutput(),
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
}
