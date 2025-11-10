#!/bin/bash

# Server restart script with logging

LOG_FILE="./logs/server-restart.log"
MAX_RESTARTS=10
RESTART_COUNT=0

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    log "Starting chess server (attempt $((RESTART_COUNT + 1)))"
    
    node server.js 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=$?
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $EXIT_CODE -eq 0 ]; then
        log "Server exited normally"
        break
    else
        log "Server crashed with exit code $EXIT_CODE, restarting in 2 seconds..."
        sleep 2
    fi
done

if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
    log "Maximum restart attempts reached, giving up"
    exit 1
fi
