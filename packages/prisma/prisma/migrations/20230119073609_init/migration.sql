-- This was created automatically by prisma migrate
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- CreateTable
CREATE TABLE "metric" (
    "device_id" TEXT NOT NULL,
    "time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cpu" DOUBLE PRECISION
);

-- CreateIndex
CREATE UNIQUE INDEX "metric_device_id_time_key" ON "metric"("device_id", "time");

-- The following content was added manually

-- Make the metric table a hypertable
SELECT create_hypertable('"metric"', 'time');

-- Continuous aggregate (CAGG) of the hypertable
CREATE MATERIALIZED VIEW metric_15min WITH (timescaledb.continuous) AS
SELECT device_id,
       time_bucket('15 min', time) AS time,
       AVG(cpu) AS cpu_avg
FROM "metric"
GROUP BY 1, 2
WITH NO DATA;

-- Add a CAGG policy in order to refresh it automatically
SELECT add_continuous_aggregate_policy('metric_15min', start_offset => INTERVAL '1 day', end_offset => INTERVAL '1 hour', schedule_interval => INTERVAL '15 min');

-- Continuous aggregate (CAGG) on top of another CAGG / Hierarchical Continuous Aggregates , new in Timescale 2.9, issue with TZ as of https://github.com/timescale/timescaledb/pull/5195
CREATE MATERIALIZED VIEW metric_1day WITH (timescaledb.continuous) AS
SELECT device_id,
       time_bucket('1 day', time) AS time,
       AVG(cpu_avg) AS cpu_avg
FROM "metric_15min"
GROUP BY 1, 2
WITH NO DATA;

-- Add a CAGG policy in order to refresh it automatically
SELECT add_continuous_aggregate_policy('metric_1day', start_offset => INTERVAL '3 days', end_offset => INTERVAL '1 day', schedule_interval => INTERVAL '15 min');

