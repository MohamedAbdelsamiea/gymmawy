-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (though it should already exist from POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS gymmawy_db;

-- Ensure the gymmawy user has proper permissions
GRANT ALL PRIVILEGES ON DATABASE gymmawy_db TO gymmawy;
GRANT ALL PRIVILEGES ON SCHEMA public TO gymmawy;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gymmawy;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gymmawy;

-- The actual schema will be created by Prisma migrations
