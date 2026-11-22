# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

- `pnpm dev`: web dev server on port 3000 (`--host`, so other devices on the LAN can reach it)
- `pnpm build`: web/server build (Nitro output in `.output/`)
- `pnpm typecheck`: `tsc --noEmit`
- `pnpm lint` / `pnpm format`: ESLint (`@tanstack/eslint-config`) / Prettier (no semicolons, double quotes, `prettier-plugin-tailwindcss`)
- `pnpm test`: Vitest, all tests. One file: `pnpm vitest run tests/shipments/format.test.ts`. One test: add `-t "name"`.
- `just dev` / `just build`: Tauri desktop app (dev / installable bundle). `just build-web`, `just preview`, `just run-built` (macOS).
- Add a shadcn component: `npx shadcn@latest add <name>`. Components go in `src/components/ui`.

Tests live in `tests/<feature>/*.test.ts` (they import from `../../src/...`) and next to the code in `src/**/*.test.ts`. There is no separate Vitest config: Vitest uses `vite.config.ts`, and the Nitro plugin is turned off when `VITEST` is set.

Env vars (`.env`): `BACKEND_URL`, `SESSION_SECRET` (≥32 chars), `JWT_SECRET`, `PUBLIC_APP_URL`, `GOOGLE_PLACES_API_KEY`, `LOG_LEVEL`, and for desktop `TRUCKHUB_DESKTOP`, `CAPTURE_PORT`.

## Architecture

TanStack Start (React 19, SSR on Nitro) frontend for a fleet/logistics app. The real backend is a separate REST API at `BACKEND_URL` (FastAPI, `/v1/...`). This app does not own a database. The browser never calls the backend directly: everything goes through TanStack Start server functions, which add the session's tokens.

### Routing
- File routes live in `src/app/` (set in `vite.config.ts` with `routesDirectory: "app"`). `src/routeTree.gen.ts` is generated. Don't edit it.
- `_auth/`: login pages. `_admin/route.tsx`: the authenticated shell. Its `beforeLoad` calls `getCurrentUser()` and redirects to `/login?redirect=…`. Sidebar, global search, shortcuts and notifications are mounted there.
- `capture.$id.tsx` + `api/capture.$id.ts`: the public phone-capture page and its API (see below).

### Feature modules (`src/features/<name>/`)
Each domain (shipments, clients, drivers, invoices, …) uses the same layers:
- `services/server.ts`: plain async functions that call the backend through `@/lib/api-client` (`getFn`, `getPaginatedFn`, `postFn`, …). These return an `ApiResponse` envelope (`isSuccess`/`data`/`error`) and never throw for API errors.
- `services/index.ts`: `createServerFn().validator(zodSchema).handler(...)` wrappers that call `server.ts` and turn an error envelope into a thrown `ApiError` (`@/types`). Components and query options only import from here.
- `query-options.ts`: query-key factory (`<entity>QueryKeys.all/list/detail(id)`) plus `queryOptions(...)` that call the server functions.
- `schemas.ts` (zod v4, also used for route search params), `types.ts`, `hooks/`, `components/`.
- Entity pickers are built from config with `createEntityPicker` (`src/lib/create-entity-picker.tsx`). A picked list row is seeded into that entity's detail query cache. See `docs/entity-picker-guide.md`.

### Auth / session
- `src/lib/session.ts`: iron-session encrypted cookie (`useAppSession()`) holding the access and refresh tokens. Call it once per operation and never keep it in module scope.
- `src/lib/api.ts`: axios instance. It adds the bearer token and, on a 401, refreshes once. Refreshes are deduped per refresh token in a module-level map, because the server is shared by all users. Only a 401 from the refresh endpoint logs the user out. Timeouts and 5xx errors fail just that request. `api-client.ts` redirects to login when `isSessionExpired(error)`.
- Permissions: `src/features/auth/permissions/*`, `usePermissions`, `<HasPermission>`.

### Desktop (Tauri, `src-tauri/`)
The desktop app doesn't ship a static frontend. `pnpm build` produces `.output/`. `scripts/prepare-sidecar.sh` copies the Bun runtime into `src-tauri/binaries` as a sidecar, plus `scripts/desktop-entry.mjs`. At runtime `src-tauri/src/lib.rs` starts Bun, which serves Nitro on `127.0.0.1:$PORT`, and the window opens on it once it is up (`splash/` shows until then). `desktop-entry.mjs` also opens a LAN "gate" on `0.0.0.0:$CAPTURE_PORT` that forwards only the phone-capture routes and assets and strips cookies.

### Phone capture (`src/features/phone-capture/`)
The desktop shows a QR code, the phone opens `/capture/$id?t=token` and uploads a photo or file, and the desktop polls and receives a `File` for the same form field. Sessions are kept in server memory (`server/store.ts`). Images are shrunk on the phone (`lib/compress-image.ts`). See `docs/phone-capture-guide.md`.

### Other
- i18n: `use-intl`, messages in `src/i18n/messages/{en,de}`. Use the typed `useTranslation(namespace)` from `@/i18n`.
- URL state: route search params with zod, plus `nuqs`. Default search params are left out of admin route URLs.
- UI: shadcn on Radix/Base UI, Tailwind v4 (`src/styles.css`), `@tabler/icons-react`/`lucide-react`. Data tables live in `src/components/data-table` and `data-grid`. Client stores (zustand) live in `src/store`.

## Conventions
- Selected/active UI states use `primary` or its tints, not foreground/black. To make a section stand out, use elevation, type and spacing, not extra colors.
- File names under `features/maintanence` and some `*-dailog.tsx` files are misspelled. Keep the existing names when importing.
