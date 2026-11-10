     ALTER TABLE problems
DROP COLUMN IF EXISTS constraints;

     ALTER TABLE problems
ADD COLUMN IF NOT EXISTS limit_time_ms int NOT NULL DEFAULT 0;

    ALTER TABLE problems
ADD COLUMN IF NOT EXISTS limit_memory_bytes int NOT NULL DEFAULT 0;

