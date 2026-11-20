#!/usr/bin/env bash
# Copies the Bun runtime into src-tauri/binaries so Tauri can bundle it as a
# sidecar. Tauri requires the file name to end with the Rust target triple.
set -euo pipefail

cd "$(dirname "$0")/.."

BUN_BIN="$(command -v bun || true)"
if [[ -z "$BUN_BIN" ]]; then
  echo "bun is required to build the desktop app: https://bun.sh" >&2
  exit 1
fi

TRIPLE="${TAURI_ENV_TARGET_TRIPLE:-$(rustc -vV | sed -n 's/^host: //p')}"
EXT=""
[[ "$TRIPLE" == *windows* ]] && EXT=".exe"

mkdir -p src-tauri/binaries
cp "$BUN_BIN" "src-tauri/binaries/bun-${TRIPLE}${EXT}"
chmod +x "src-tauri/binaries/bun-${TRIPLE}${EXT}"
echo "sidecar: src-tauri/binaries/bun-${TRIPLE}${EXT}"

# Entry that starts Nitro plus the phone-capture LAN gate
cp scripts/desktop-entry.mjs .output/server/desktop-entry.mjs
echo "entry: .output/server/desktop-entry.mjs"
