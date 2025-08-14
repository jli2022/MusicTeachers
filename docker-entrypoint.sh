#!/bin/sh

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."

# Function to check if PostgreSQL is ready
wait_for_postgres() {
  until nc -z postgres 5432; do
    echo "PostgreSQL is not ready - sleeping"
    sleep 1
  done
  echo "PostgreSQL is ready!"
}

# Check if we're in development or production
if [ "$NODE_ENV" = "development" ]; then
  wait_for_postgres
  echo "Running in development mode..."
  npx prisma db push
  exec npm run dev
else
  wait_for_postgres
  echo "Running in production mode..."
  npx prisma db push
  exec node server.js
fi