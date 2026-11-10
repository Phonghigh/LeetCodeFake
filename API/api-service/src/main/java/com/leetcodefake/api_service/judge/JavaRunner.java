package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.RunResult;
import com.leetcodefake.api_service.common.exception.SandboxExecutionException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;


public class JavaRunner implements LanguageRunner{
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
    public ExecutionResult run(String input, String expectedOutput, Path workingDirPath) {
        ProcessBuilder runner = new ProcessBuilder("java", "Main");
        return executor.execute(runner,  workingDirPath, timeLimitMs, memoryLimitBytes);
    }

    @Override
    public void prepareResources(String code, Path workingDirPath) throws IOException {
        // Write the code to a file named Main.java in the working directory
        Path javaFilePath = workingDirPath.resolve("Main.java");
        Files.writeString(javaFilePath, code);
    }
}