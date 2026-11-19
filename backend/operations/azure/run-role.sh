#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
  api) entrypoint=backend/src/server.js ;;
  notification) entrypoint=backend/src/workers/notification.js ;;
  expiry) entrypoint=backend/src/workers/expiry.js ;;
  recovery) entrypoint=backend/src/workers/recovery.js ;;
  *) echo 'Expected api, notification, expiry, or recovery' >&2; exit 64 ;;
esac

# Install Node system-wide so every service uses the same version.
exec /usr/bin/node "$entrypoint"
