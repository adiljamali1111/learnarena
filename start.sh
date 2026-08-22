#!/bin/sh
# Robust startup script for LearnArena.
#
# Why this exists:
#  - The preview sandbox gets recycled periodically. Each recycle kills the
#    dev-server process tree, which surfaces in the preview panel as
#    "Dev server failed with exit code -1" (the process was terminated by a
#    signal, not a code crash). Once the recycle finishes, Vite must come
#    straight back up — this script makes that automatic.
#  - On a fresh sandbox node_modules can be missing or partially installed,
#    so dependencies are ensured first (with retries for flaky installs).
#  - --strictPort is used so Vite NEVER silently moves off 5173: if the port
#    is briefly held by a dying process, Vite exits immediately and the loop
#    retries in 2s instead of orphaning the preview proxy on port 5174.

echo "[start.sh] Ensuring dependencies..."

MAX_ATTEMPTS=5
attempt=1
installed=0
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  echo "[start.sh] npm install attempt $attempt/$MAX_ATTEMPTS..."
  if npm install --no-audit --no-fund > /tmp/start-npm-install.log 2>&1; then
    echo "[start.sh] npm install succeeded"
    installed=1
    break
  fi
  echo "[start.sh] npm install failed (attempt $attempt/$MAX_ATTEMPTS), retrying in 2s..."
  sleep 2
  attempt=$((attempt + 1))
done

if [ "$installed" -ne 1 ]; then
  echo "[start.sh] npm install failed after $MAX_ATTEMPTS attempts"
  tail -20 /tmp/start-npm-install.log
  exit 1
fi

echo "[start.sh] Starting Vite..."
while true; do
  echo "[start.sh] Launching Vite at $(date)"
  npx vite --host 0.0.0.0 --port 5173 --strictPort
  RC=$?
  echo "[start.sh] Vite exited with code $RC at $(date) — restarting in 2s"
  sleep 2
done
