package com.leetcodefake.api_service.outboxEvent;

public interface OutboxAggregate {
    String getAggregateType();
    long getAggregateId();
}
