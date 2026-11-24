package com.leetcodefake.api_service.judge.execution.process;

import com.leetcodefake.api_service.common.enums.RunResult;
import com.leetcodefake.api_service.common.exception.SandboxExecutionException;
import com.leetcodefake.api_service.judge.result.CompileResult;
import com.leetcodefake.api_service.judge.result.ExecutionResult;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class SandboxProcessExecutor {
    private ReaderOutput processOutput(Process process, int memoryLimitBytes, long timeLimitMs) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        final AtomicBoolean memoryLimitExceeded = new AtomicBoolean(false);
        final AtomicReference<IOException> readError = new AtomicReference<>();

        Thread reader = new Thread(() -> {
            try {
                InputStream inputStream = process.getInputStream();
                byte[] buffer = new byte[1024];
                int bytesRead;
                int totalBytesRead = 0;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                    totalBytesRead += bytesRead;
                    if (totalBytesRead > memoryLimitBytes) {
                        memoryLimitExceeded.set(true);
                        process.destroyForcibly();
                        break;
                    }
                }
            } catch (IOException e) {
                if (!memoryLimitExceeded.get()) {
                    readError.set(e);
                }
            }
        });
        reader.start();
        return new ReaderOutput(reader, outputStream, memoryLimitExceeded, readError);
    }

    private WriterOutput processWriter(Process process, String input) {
        final AtomicReference<IOException> writeError = new AtomicReference<>();

        Thread writer = new Thread(() -> {
            try (OutputStream os = process.getOutputStream()) {
                os.write(input.getBytes(StandardCharsets.UTF_8));
                os.flush();
            } catch (IOException e) {
                writeError.set(e);
            }
        });
        writer.start();
        return new WriterOutput(writer, writeError);
    }

    public CompileResult compile(ProcessBuilder compiler, Path workingDirPath, int memoryLimitBytes, long timeLimitMs) {
        try {
            compiler.directory(workingDirPath.toFile());
            compiler.redirectErrorStream(true);
            Process process = compiler.start();
            ReaderOutput readerOutput = this.processOutput(process, memoryLimitBytes, timeLimitMs);
            boolean finished = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new CompileResult(
                        -1,
                        "Compilation timed out"
                );
            }
            int exitcode = process.exitValue();
            readerOutput.reader().join();
            if (readerOutput.memoryLimitExceeded().get()) {
                return new CompileResult(
                        exitcode,
                        "Memory limit exceeded during compilation"
                );
            }
            if (readerOutput.readError().get() != null) {
                return new CompileResult(
                        exitcode,
                        "Error occurred while reading compilation output: " + readerOutput.readError().get().getMessage()
                );
            }
            String output = readerOutput.outputStream().toString();
            return new CompileResult(exitcode, output);
        } catch (IOException e) {
            throw  new SandboxExecutionException("Error occurred while compiling Java code", e);
        }
        catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SandboxExecutionException("Error occurred while compiling Java code", e);
        }
    }

    public ExecutionResult execute(ProcessBuilder runner, Path workingDirPath, long timeLimitMs, int memoryLimitBytes, String input) {
        try {
            runner.directory(workingDirPath.toFile());
            runner.redirectErrorStream(true);
            long startTime = System.currentTimeMillis();
            Process process = runner.start();
            ReaderOutput readerOutput = this.processOutput(process, memoryLimitBytes, timeLimitMs);
            WriterOutput writerOutput = this.processWriter(process, input);
            boolean finished = process.waitFor(timeLimitMs , TimeUnit.MILLISECONDS);
            long duration = System.currentTimeMillis() - startTime;
            if (!finished) {
                process.destroyForcibly();
                return new ExecutionResult(
                        false,
                        null,
                        -1,
                        duration,
                        -1,
                        RunResult.TIME_LIMIT_EXCEEDED
                );
            }
            writerOutput.writer().join();
            readerOutput.reader().join();
            if (readerOutput.memoryLimitExceeded().get()) {
                return new ExecutionResult(
                        false,
                        null,
                        -1,
                        duration,
                        -1,
                        RunResult.MEMORY_LIMIT_EXCEEDED
                );
            }
            if (readerOutput.readError().get() != null) {
                throw new RuntimeException(readerOutput.readError().get());
            }
            if (writerOutput.readError().get() != null) {
                throw new RuntimeException(writerOutput.readError().get());
            }

            String output = readerOutput.outputStream().toString();
            int exitcode = process.exitValue();
            return new ExecutionResult(
                    exitcode == 0,
                    output,
                    exitcode,
                    duration,
                    -1,
                    exitcode == 0 ? RunResult.NORMAL : RunResult.RUNTIME_ERROR
            );

        } catch (IOException e) {
            throw new SandboxExecutionException("Error occurred while running Java code", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }
}
