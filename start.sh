#!/bin/sh
# Robust startup script for LearnArena
# Retries npm install on fresh sandboxes, keeps Vite alive across reprovisioning.

npm_install_with_retry() {
  MAX=5
  for i in $(seq 1 $MAX); do
    echo "[start.sh] npm install attempt $i/$MAX..."
    if npm install --no-audit --no-fund 2>&1 | tail -2; then
      echo "[start.sh] npm install succeeded"
      return 0
    fi
    echo "[start.sh] npm install failed, retrying in 2s..."
    sleep 2
  done
  echo "[start.sh] npm install failed after $MAX attempts"
  exit 1
}

echo "[start.sh] Ensuring dependencies..."
npm_install_with_retry

echo "[start.sh] Starting Vite..."
while true; do
  echo "[start.sh] Launching Vite at $(date)"
  npx vite --host 0.0.0.0 --port 5173
  RC=$?
  echo "[start.sh] Vite exited with code $RC at $(date) — restarting in 2s"
  sleep 2
done