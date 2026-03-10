#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "Error: .env file not found"
  exit 1
fi

source .env

REQUIRED_VARS=(DATABASE_URL ORIGIN BETTER_AUTH_SECRET PHID_CLIENT_ID SIGN_DASH_API_KEY)
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set in .env"
    exit 1
  fi
done

echo "Building containers..."
docker compose build

echo "Starting containers..."
docker compose up -d

echo "Waiting for database to be ready..."
sleep 3

echo "Running database migrations..."
docker compose exec app npx drizzle-kit push

echo "Deployment complete. App running at http://localhost:3000"
