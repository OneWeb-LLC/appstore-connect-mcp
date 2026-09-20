#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ ! -f "$ROOT_DIR/package.json" && -f /workspace/package.json ]]; then
  ROOT_DIR="/workspace"
fi

cd "$ROOT_DIR"

if [[ ! -f "$ROOT_DIR/dist/index.js" ]]; then
  npm install
  npm run build
fi

exec node "$ROOT_DIR/dist/index.js"
