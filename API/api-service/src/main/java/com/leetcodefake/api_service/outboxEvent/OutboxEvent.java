package com.leetcodefake.api_service.outboxEvent;

import com.leetcodefake.api_service.common.enums.AggregateType;
import com.leetcodefake.api_service.common.enums.OutboxEventStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "outbox_events")
@Builder
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "aggregate_type")
    @Enumerated(EnumType.STRING)
    AggregateType aggregateType;

    @Column(nullable = false,name = "aggregate_id")
    private Long aggregateId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OutboxEventStatus status;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {

        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public  OutboxEvent(OutboxAggregate aggregate) {
        this.status = OutboxEventStatus.PENDING;
        this.aggregateType = AggregateType.valueOf(aggregate.getAggregateType());
        this.aggregateId = aggregate.getAggregateId();
    }
}
