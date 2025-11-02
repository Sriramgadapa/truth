-- 0001_add_analysis_cache.sql

-- Create the analysis_cache table
CREATE TABLE
  analysis_cache (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL UNIQUE,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );

-- Create an index on the hash column for faster lookups
CREATE INDEX
  idx_analysis_cache_hash ON analysis_cache (hash);
