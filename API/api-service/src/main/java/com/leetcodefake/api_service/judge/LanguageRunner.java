package com.leetcodefake.api_service.judge;

import java.io.IOException;
import java.nio.file.Path;

public interface LanguageRunner {
    CompileResult compile(Path path);
    ExecutionResult run(String input, String expectedOutput, Path WorkingDirPath);
    void prepareResources(String code, Path path) throws IOException;
}
