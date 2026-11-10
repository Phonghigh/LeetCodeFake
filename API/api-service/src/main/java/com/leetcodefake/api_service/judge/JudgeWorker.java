package com.leetcodefake.api_service.judge;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class JudgeWorker {
    private final JudgeService judgeService;

    public JudgeWorker(JudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @Scheduled(fixedRate = 5000)
    public void judge() {

    }
}
