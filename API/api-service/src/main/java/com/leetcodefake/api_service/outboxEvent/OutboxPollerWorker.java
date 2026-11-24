package com.leetcodefake.api_service.outboxEvent;

import com.leetcodefake.api_service.redisService.RedisQueueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class OutboxPollerWorker {
    private final RedisQueueService redisQueueService;
    private final OutboxTransactionService outboxTransactionService;

    public OutboxPollerWorker(OutboxTransactionService outboxTransactionService, RedisQueueService redisQueueService) {
        this.outboxTransactionService = outboxTransactionService;
        this.redisQueueService = redisQueueService;
    }

    @Scheduled(fixedDelay = 5000)
    public void scheduleOutboxEvent() {
        // Poll the outbox table for pending events and push them to the Redis queue
        List<OutboxEvent> events = outboxTransactionService.pushToProcessingQueue();

        // Push the events to the Redis queue
        events.forEach(event -> {
            redisQueueService.enqueue("outboxEventQueue", event.getAggregateId());
            log.info("Pushed event to Redis queue: {}", event.getAggregateId());
        });

        // Mark the events as done in the outbox table
        outboxTransactionService.markDone(events);
    }

}
