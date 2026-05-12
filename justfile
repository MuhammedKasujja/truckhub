#!/usr/bin/env just --justfile
# =============================================================================
# Default
# =============================================================================

default:
    @just --list

# Start the dev server
dev:
    pnpm tauri dev

run:
    pnpm tauri dev
