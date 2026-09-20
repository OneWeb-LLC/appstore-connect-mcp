#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "$ROOT_DIR/dist/index.js" ]]; then
  npm install
  npm run build
fi

exec node "$ROOT_DIR/dist/index.js"
