#!/usr/bin/env zsh
# Safe helper to stop and remove a Docker container without noisy errors
# Usage: safe-rm-container.sh <container-id-or-name> [timeout-seconds]

set -euo pipefail

CONTAINER=${1:-}
TIMEOUT=${2:-30}

if [[ -z "${CONTAINER}" ]]; then
  echo "Usage: $0 <container-id-or-name> [timeout-seconds]"
  exit 2
fi

# Check Docker daemon availability
if ! docker info >/dev/null 2>&1; then
  echo "Cannot connect to the Docker daemon. Is Docker running on this host?"
  exit 3
fi

# Helper to check existence (ID or name partial match)
if docker ps -a --no-trunc --format "{{.ID}} {{.Names}}" | grep -Fq -- "${CONTAINER}"; then
  echo "Container \"${CONTAINER}\" found — attempting graceful stop with --timeout=${TIMEOUT}"
  docker stop --timeout="${TIMEOUT}" "${CONTAINER}" || { echo "docker stop failed or container stopped already; attempting force remove"; }

  echo "Removing container \"${CONTAINER}\""
  docker rm -f "${CONTAINER}" || { echo "docker rm failed; container might have been removed already or you lack permissions"; exit 4; }

  echo "Container \"${CONTAINER}\" stopped and removed."
  exit 0
else
  echo "Container \"${CONTAINER}\" not found. Nothing to do."
  exit 0
fi
