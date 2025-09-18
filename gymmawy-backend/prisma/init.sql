-- Database initialization script
-- This will be run when the database container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE gymmawy'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gymmawy')\gexec

-- Connect to the database
\c gymmawy;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
