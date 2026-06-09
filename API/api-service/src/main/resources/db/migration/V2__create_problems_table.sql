CREATE TABLE problems (
    id          BIGSERIAL    PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    difficulty  VARCHAR(10)  NOT NULL,
    description TEXT,
    constraints TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255) NOT NULL,
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_by  VARCHAR(255) NOT NULL
);