#!/usr/bin/env just --justfile
# =============================================================================
# Default
# =============================================================================

default:
    #!/usr/bin/env bash
    @just --list

# Start the dev server
dev:
    #!/usr/bin/env bash
    pnpm tauri dev

# Start the dev server
build:
    #!/usr/bin/env bash
    pnpm tauri build

build-web:
    #!/usr/bin/env bash
    pnpm run build
