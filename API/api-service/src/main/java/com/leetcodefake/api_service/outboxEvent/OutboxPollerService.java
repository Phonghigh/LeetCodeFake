package com.leetcodefake.api_service.outboxEvent;

import com.leetcodefake.api_service.redisService.RedisQueueService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutboxPollerService {
    private final RedisQueueService redisQueueService;
    private final OutboxTransactionService outboxTransactionService;

    public OutboxPollerService(OutboxTransactionService outboxTransactionService, RedisQueueService redisQueueService) {
        this.outboxTransactionService = outboxTransactionService;
        this.redisQueueService = redisQueueService;
    }

    @Scheduled(fixedDelay = 5000)
    public void scheduleOutboxEvent() {
        // Poll the outbox table for pending events and push them to the Redis queue
        List<OutboxEvent> events = outboxTransactionService.pushToProcessingQueue();

        // Push the events to the Redis queue
        events.forEach(event -> {
            redisQueueService.enqueue("outboxEventQueue", event);
        });

        // Mark the events as done in the outbox table
        outboxTransactionService.markDone(events);
    }

}
