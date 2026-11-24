package com.leetcodefake.api_service.judge.execution.language.java;

import com.leetcodefake.api_service.judge.execution.language.LanguageRunner;
import com.leetcodefake.api_service.judge.execution.process.SandboxProcessExecutor;
import com.leetcodefake.api_service.judge.result.CompileResult;
import com.leetcodefake.api_service.judge.result.ExecutionResult;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;


public class JavaRunner implements LanguageRunner {
    private final long timeLimitMs;
    private final int memoryLimitBytes;
    private final SandboxProcessExecutor executor;


    public JavaRunner(long timeLimitMs, int memoryLimitBytes, SandboxProcessExecutor executor) {
        this.timeLimitMs = timeLimitMs;
        this.memoryLimitBytes = memoryLimitBytes;
        this.executor = executor;
    }

    @Override
    public CompileResult compile(Path path) {
        //Compile the code using javac
        ProcessBuilder compiler = new ProcessBuilder("javac", "Main.java");
        return executor.compile(compiler, path, memoryLimitBytes, timeLimitMs);
    }

    @Override
    public ExecutionResult run(String input, Path workingDirPath) {
        ProcessBuilder runner = new ProcessBuilder("java", "Main");
        return executor.execute(runner,  workingDirPath, timeLimitMs, memoryLimitBytes, input);
    }

    @Override
    public void prepareResources(String code, Path workingDirPath) throws IOException {
        // Write the code to a file named Main.java in the working directory
        Path javaFilePath = workingDirPath.resolve("Main.java");
        Files.writeString(javaFilePath, code);
    }
}