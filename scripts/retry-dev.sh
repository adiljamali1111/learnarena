#!/bin/bash
# Retry wrapper for Vite dev server — handles sandbox reprovisioning delay

MAX_RETRIES=10
RETRY_DELAY=3

for i in $(seq 1 $MAX_RETRIES); do
  echo "[retry-dev] Attempt $i of $MAX_RETRIES..."

  # Start vite in background
  npx vite --host 0.0.0.0 --port 5173 &
  VITE_PID=$!

  # Give it a moment to either fail or start listening
  sleep 2

  # Check if it's actually listening
  if kill -0 "$VITE_PID" 2>/dev/null; then
    # Process is still running — assume it started successfully
    wait "$VITE_PID"
    exit $?
  fi

  # Vite exited early — sandbox was likely provisioning
  echo "[retry-dev] Sandbox not ready yet. Retrying in ${RETRY_DELAY}s..."
  sleep "$RETRY_DELAY"
done

echo "[retry-dev] Failed to start Vite after $MAX_RETRIES attempts."
exit 1