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
    npx vite preview
