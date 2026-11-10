package com.leetcodefake.api_service.judge;

import com.leetcodefake.api_service.common.enums.Language;
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