#!/usr/bin/env bash
# Generates a base64 session secret suitable for SESSION_SECRET
# Usage: ./scripts/generate-session-secret.sh
set -euo pipefail
head -c 48 /dev/urandom | openssl base64
