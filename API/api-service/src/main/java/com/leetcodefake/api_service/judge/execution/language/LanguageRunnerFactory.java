package com.leetcodefake.api_service.judge.execution.language;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.judge.execution.language.java.JavaRunner;
import com.leetcodefake.api_service.judge.execution.process.SandboxProcessExecutor;
import org.springframework.stereotype.Component;

@Component
public class LanguageRunnerFactory {
    private final SandboxProcessExecutor executor;


    public LanguageRunnerFactory(SandboxProcessExecutor executor) {
        this.executor = executor;
    }

    public LanguageRunner createLanguageRunner(Language language, long timeLimitMs, int memoryLimitBytes) {
        return switch (language) {
            case JAVA -> new JavaRunner(timeLimitMs, memoryLimitBytes, executor);
            default -> {
                throw new RuntimeException("Language not supported");
            }
        };
    }
}