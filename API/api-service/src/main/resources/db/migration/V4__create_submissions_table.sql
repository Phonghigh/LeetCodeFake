CREATE TABLE submissions (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id),
    problem_id  BIGINT       NOT NULL REFERENCES problems(id),
    language    VARCHAR(10)  NOT NULL,
    source_code TEXT         NOT NULL,
    status      VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    runtime     INTEGER,
    memory      INTEGER,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255) NOT NULL,
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_by  VARCHAR(255) NOT NULL
);