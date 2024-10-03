#!/bin/bash

# This script polls the Cognito Local server until the /health endpoint
# responds with a 200. If the server doesn't respond in time, or exits with a non-zero code, the
# script will fail.
#
# We run this in CI to prove the actual server can start. This catches some edge-cases where
# everything else passes, but something in the compile produced invalid JavaScript.

wget --retry-connrefused --retry-on-http-error=404 --tries=30 -q --wait=1 --spider "http://localhost:$PORT/health"