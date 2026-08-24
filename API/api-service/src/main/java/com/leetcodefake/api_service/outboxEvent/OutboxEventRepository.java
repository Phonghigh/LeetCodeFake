package com.leetcodefake.api_service.outboxEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
    @Query(
            value = "SELECT * " +
                    "FROM outbox_events s " +
                    "WHERE s.status = 'PENDING' OR (s.status = 'PROCESSING' AND s.updated_at < NOW() - INTERVAL '5 minutes') " +
                    "ORDER BY created_at " +
                    "LIMIT 50 " +
                    "FOR UPDATE SKIP LOCKED;",
            nativeQuery = true)
    Collection<OutboxEvent> findAllPendingOutboxEventsNative();

}