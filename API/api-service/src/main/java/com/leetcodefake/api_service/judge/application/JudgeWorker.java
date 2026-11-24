package com.leetcodefake.api_service.judge.application;

import com.leetcodefake.api_service.common.enums.SubmissionStatus;
import com.leetcodefake.api_service.redisService.RedisQueueService;
import com.leetcodefake.api_service.submission.SubmissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JudgeWorker {
    private final JudgeService judgeService;
    private RedisQueueService redisQueueService;
    private SubmissionService submissionService;

    public JudgeWorker(JudgeService judgeService, RedisQueueService redisQueueService, SubmissionService submissionService) {
        this.judgeService = judgeService;
        this.redisQueueService = redisQueueService;
        this.submissionService = submissionService;
    }

    @Scheduled(fixedDelay = 5000)
    public void judge() {
        Object value;
        while ((value = redisQueueService.dequeue("outboxEventQueue")) != null) {
            Long submissionId = ((Number) value).longValue();
            log.info("Processing event with submissionId {}", submissionId);
            try {
                judgeService.judge(submissionId);
            } catch (Exception e) {
                // Log the error and continue processing the next event
                log.error("Error processing event with submissionId {}", submissionId, e);
                try {
                    submissionService.updateStatus(submissionId, SubmissionStatus.SYSTEM_ERROR);
                } catch (Exception ex) {
                    log.error("Error updating submission status with submissionId {}", submissionId, ex);
                }
            }
        }

    }
}
