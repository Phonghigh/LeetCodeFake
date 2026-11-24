package com.leetcodefake.api_service.judge.execution.language;

import com.leetcodefake.api_service.judge.result.CompileResult;
import com.leetcodefake.api_service.judge.result.ExecutionResult;

import java.io.IOException;
import java.nio.file.Path;

public interface LanguageRunner {
    CompileResult compile(Path path);
    ExecutionResult run(String input, Path WorkingDirPath);
    void prepareResources(String code, Path path) throws IOException;
}
