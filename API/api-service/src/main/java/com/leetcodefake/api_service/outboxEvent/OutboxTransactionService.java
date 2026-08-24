package com.leetcodefake.api_service.outboxEvent;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutboxTransactionService {

    private final OutboxEventRepository outboxEventRepository;

    public OutboxTransactionService(OutboxEventRepository outboxEventRepository) {
        this.outboxEventRepository = outboxEventRepository;
    }

    @Transactional
    public List<OutboxEvent> pushToProcessingQueue() {
        List<OutboxEvent> events = (List<OutboxEvent>) outboxEventRepository.findAllPendingOutboxEventsNative();
        events.forEach(event -> event
                .setStatus(com.leetcodefake.api_service.common.enums.OutboxEventStatus.PROCESSING));
        outboxEventRepository.saveAll(events);
        return events;
    }

    @Transactional
    public void markDone(List<OutboxEvent> outboxEvents) {
        outboxEvents.forEach(event -> event.setStatus(com.leetcodefake.api_service.common.enums.OutboxEventStatus.DONE));
        outboxEventRepository.saveAll(outboxEvents);
    }
}
