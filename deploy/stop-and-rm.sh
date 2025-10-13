#!/usr/bin/env bash
# Wrapper script for safe container stop and remove
# Usage: stop-and-rm.sh <container-id-or-name> [timeout-seconds]

set -euo pipefail

CID=${1:-}
TIMEOUT=${2:-30}
PROJ_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${CID}" ]]; then
  echo "Usage: $0 <container-id-or-name> [timeout-seconds]"
  exit 2
fi

# Call the safe helper
"${PROJ_ROOT}/scripts/safe-rm-container.sh" "${CID}" "${TIMEOUT}"
