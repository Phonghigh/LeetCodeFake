CREATE TABLE outbox_events (
    id          BIGSERIAL    PRIMARY KEY,
    aggregate_type VARCHAR(30)       NOT NULL,
    aggregate_id BIGINT       NOT NULL,
    status      VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_events_created_at
    ON outbox_events(created_at)
    WHERE status = 'PENDING';