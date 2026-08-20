#!/bin/sh
# Robust startup script — retries npm install if the sandbox is still provisioning
# and restarts Vite if it's killed during sandbox reprovisioning.

MAX_RETRIES=5
RETRY_DELAY=2

for i in $(seq 1 $MAX_RETRIES); do
  echo "[start.sh] Attempt $i/$MAX_RETRIES: npm install..."
  if npm install --no-audit --no-fund --prefer-offline; then
    echo "[start.sh] npm install succeeded, starting Vite..."
    # Loop so Vite is restarted if killed by sandbox reprovisioning
    while true; do
      npx vite --host 0.0.0.0 --port 5173
      EXIT_CODE=$?
      echo "[start.sh] Vite exited with code $EXIT_CODE, restarting in 2s..."
      sleep 2
    done
    exit 0
  fi
  echo "[start.sh] npm install failed (exit code $?), retrying in ${RETRY_DELAY}s..."
  sleep "$RETRY_DELAY"
done

echo "[start.sh] npm install failed after $MAX_RETRIES attempts"
exit 1