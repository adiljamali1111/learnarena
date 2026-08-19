#!/bin/bash
# Retry wrapper for Vite dev server — handles sandbox reprovisioning delay
# Installs dependencies first, then retries starting Vite until it succeeds.
# Once Vite is running, this stays alive with it.

MAX_RETRIES=10
RETRY_DELAY=3

# First, ensure dependencies are installed
echo "[retry-dev] Installing dependencies..."
npm install --no-audit --no-fund 2>&1 | tail -5

for i in $(seq 1 $MAX_RETRIES); do
  echo "[retry-dev] Attempt $i of $MAX_RETRIES..."

  # Run Vite in the foreground — if it starts successfully, this runs forever
  # If the sandbox is provisioning, Vite exits immediately with non-zero
  npx vite --host 0.0.0.0 --port 5173

  # If we get here, Vite exited (either failed to start or was killed)
  EXIT_CODE=$?
  echo "[retry-dev] Vite exited with code $EXIT_CODE."

  # If it ran successfully and then got killed (exit code from signal), don't retry
  if [ $EXIT_CODE -ge 128 ] && [ $EXIT_CODE -ne 255 ]; then
    echo "[retry-dev] Vite was terminated (signal $((EXIT_CODE - 128))). Exiting."
    exit $EXIT_CODE
  fi

  echo "[retry-dev] Sandbox not ready yet. Retrying in ${RETRY_DELAY}s..."
  sleep "$RETRY_DELAY"
done

echo "[retry-dev] Failed to start Vite after $MAX_RETRIES attempts."
exit 1