CREATE TABLE test_cases (
    id              BIGSERIAL PRIMARY KEY,
    problem_id      BIGINT    NOT NULL REFERENCES problems(id),
    input           TEXT,
    expected_output TEXT,
    is_hidden       BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255) NOT NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by      VARCHAR(255) NOT NULL
);