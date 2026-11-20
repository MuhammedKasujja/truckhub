#!/usr/bin/env just --justfile
# =============================================================================
# Default
# =============================================================================

#  === List all available commands ====
default:
    @just --list

# Start the dev server
dev:
    #!/usr/bin/env bash
    pnpm tauri dev

# Creates a desktop installeable image of the application
build:
    #!/usr/bin/env bash
    pnpm tauri build

# Builds a web app
build-web:
    #!/usr/bin/env bash
    pnpm run build

preview:
    #!/usr/bin/env bash
    npx vite preview --host 0.0.0.0 --port 4173 --strictPort

# Open the desktop app produced by `just build` (macOS)
run-built:
    open src-tauri/target/release/bundle/macos/Truckhub.app
