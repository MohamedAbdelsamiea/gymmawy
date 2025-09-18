#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run Prisma seed (if needed)
echo "Seeding database..."
npx prisma db seed || echo "No seed script found or seeding failed"

# Start the application
echo "Starting application..."
exec "$@"
