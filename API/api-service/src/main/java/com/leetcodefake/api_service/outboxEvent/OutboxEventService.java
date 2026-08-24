package com.leetcodefake.api_service.outboxEvent;

import com.leetcodefake.api_service.common.enums.AggregateType;
import com.leetcodefake.api_service.common.enums.OutboxEventStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OutboxEventService {
    private  OutboxEventRepository outboxEventRepository;

    public OutboxEventService(OutboxEventRepository outboxEventRepository) {
        this.outboxEventRepository = outboxEventRepository;
    }

    public OutboxEvent addOutboxEvent(
            AggregateType aggregateType,
            long aggregateId
    ) {
        OutboxEvent outboxEvent = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .status(OutboxEventStatus.PENDING)
                .build();

        return outboxEventRepository.save(outboxEvent);
    }

}
