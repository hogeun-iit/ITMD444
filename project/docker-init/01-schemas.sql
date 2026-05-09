-- Per-service PostgreSQL schemas (단일 DB, 논리 분리)
CREATE SCHEMA IF NOT EXISTS tubedeck_auth;
CREATE SCHEMA IF NOT EXISTS tubedeck_queue;
CREATE SCHEMA IF NOT EXISTS tubedeck_video;
CREATE SCHEMA IF NOT EXISTS tubedeck_analysis;
