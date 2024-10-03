#!/bin/bash

# This script launches the Cognito Local server, then polls the server until the /health endpoint
# responds with a 200. If the server doesn't respond in time, or exits with a non-zero code, the
# script will fail.
#
# We run this in CI to prove the actual server can start. This catches some edge-cases where
# everything else passes, but something in the compile produced invalid JavaScript.

PORT=$(scripts/get-free-port.sh)

echo Using port $PORT

PORT=$PORT yarn start &
YARN_PID=$!

trap "kill $YARN_PID" SIGINT

PORT=$PORT scripts/smoke-test.sh
EXIT_CODE=$?

kill $YARN_PID

PID=$(lsof -i tcp:$PORT | awk 'NR!=1 {print $2}')
kill $PID

if [[ $EXIT_CODE -ne 0 ]]; then
  echo Failed to start in time >&2
  exit 1
else
  echo Test success
  exit 0
fi