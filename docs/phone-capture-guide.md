# Phone Capture: Developer Guide

## What this is

A way for a desktop user to take a photo or pick a file **on their phone** and
have it land in a file input **on the desktop**, ready for the normal upload.

```
Desktop                          TanStack Start server            Phone
───────                          ─────────────────────            ─────
"Use phone"  ── create ────────▶  session in memory
show QR code ◀── { id, url } ───
                                                          ◀── scan QR, open /capture/$id?t=…
poll status every 1.5 s ───────▶  pending                 ◀── take photo / choose file
                                  ready  ◀──── upload ─────── "Send to computer"
take file  ─────────────────────▶ returns bytes, deletes session
onFile(file)  →  same state / form field the <input type="file"> uses
```

FastAPI is not involved until the user submits the form. The TanStack Start
server only holds the file briefly between the phone and the desktop.

On a phone or tablet (`pointer: coarse`), there is no QR code. The button
becomes a **Take photo** shortcut that opens the camera directly. The form's
existing file input already offers the gallery and Files.

---

## Using it in a form

```tsx
import { PhoneCaptureButton } from "@/features/phone-capture"

<PhoneCaptureButton
  accept=".jpg,.jpeg,.png,.pdf"   // same value as the file input's accept
  onFile={(file) => setFile(file)} // or field.onChange for react-hook-form
/>
```

| Prop        | Type                   | Default                     | Notes                                                                                     |
| ----------- | ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------- |
| `onFile`    | `(file: File) => void` | required                    | Gets a real `File`, the same thing a file input gives you.                                 |
| `accept`    | `string`               | `image/*,application/pdf`   | Extensions, MIME types or wildcards. The phone and the server both enforce it.            |
| `label`     | `string`               | `"Use phone"`               | Desktop button text.                                                                      |
| `className` | `string`               |                             |                                                                                           |

The rest of the form does not change. Preview, validation, `objectToFormData`
and the server function that posts to FastAPI all work as before.

**Where it is used today**

- `features/documents/components/upload-document-dialog.tsx`: `accept` is the
  document type's `allowed_content_types`.
- `features/drivers/components/driver-registration-form.tsx`: shown only
  while the field is empty.

---

## Files

```
src/features/phone-capture/
├── index.ts                         public export: PhoneCaptureButton
├── components/phone-capture-button.tsx
├── hooks/use-phone-capture.ts       session lifecycle + polling
├── services/index.ts                server functions (desktop side)
├── server/capture-api.ts            phone-side logic behind /api/capture/$id
├── server/lan-ip.ts                 this computer's Wi-Fi address (desktop app)
├── server/store.ts                  in-memory session store (server only)
├── server/*.test.ts
└── lib/
    ├── accept.ts                    matchesAccept(), acceptsImages()
    └── compress-image.ts            client-side photo resize
src/app/capture.$id.tsx              public page the phone opens
src/app/api/capture.$id.ts           GET info / POST upload for the phone
scripts/desktop-entry.mjs            desktop app: Nitro + phone LAN gate
```

### `usePhoneCapture({ accept, onFile })`

Returns `{ state, url, expiresAt, sameWifi, error, start, cancel }`.
`sameWifi` is true in the desktop app, where the dialog tells the user the
phone must be on the same Wi-Fi. `error` is the server's message when a code
can't be made (e.g. the computer isn't on a network).

`state` is one of `idle | creating | waiting | receiving | expired | error`.
Status is polled with react-query (`refetchInterval: 1500`) only while
`waiting`. The code also expires on the client when `expiresAt` passes.

### Server functions (`services/index.ts`)

| Function                 | Who calls it | Auth                        | Does                                                                 |
| ------------------------ | ------------ | --------------------------- | -------------------------------------------------------------------- |
| `createCaptureSessionFn` | desktop      | signed-in user (session)    | Creates a session and returns `{ id, url, expiresAt, sameWifi }`.    |
| `getCaptureStatusFn`     | desktop      | session owner only          | Returns `pending`, `ready` or `expired`.                             |
| `takeCaptureFileFn`      | desktop      | session owner only          | Returns the bytes as a `Response` once, then deletes the session.    |
| `cancelCaptureSessionFn` | desktop      | session owner only          | Deletes the session when the dialog is closed.                       |
| `getCaptureInfoFn`       | phone page's server render | upload token  | Returns `{ accept, expiresAt }`, or `null` when the link is dead.    |

The phone's own browser never calls server functions. It uses a fixed-path
server route, so the desktop app's LAN gate can allow exactly these paths:

| Route                         | Does                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `GET /api/capture/$id?t=`     | `{ accept, expiresAt }`, or 404 when the link is dead.                       |
| `POST /api/capture/$id`       | FormData `{ token, file }`. Checks type and size, then stores it. Errors are `{ message }` with 400/404/415. |

> None of these may use `apiClient`. Its interceptor adds the signed-in
> user's FastAPI token, and the phone has no session.

### The phone page (`/capture/$id?t=<token>`)

It sits outside `_admin`, so no sign-in is required. The steps are:
**Take photo / Choose file → preview → Send → "Sent"**, or "This link has
expired".

- **Take photo** uses `accept="image/*" capture="environment"` and is shown
  only if `accept` allows images.
- **Choose file** uses the session's `accept` without `capture`, so the phone
  shows its normal picker: Photos, Files, Drive, iCloud and the camera.
- Photos are resized before upload (longest side 2000 px, JPEG 0.85). If
  the JPEG would not match `accept`, or the browser cannot decode the image
  (some HEIC files), the original is sent. PDFs and other files are never
  changed.

---

## Security

- The session id is `uuid()`. The upload token is a separate
  32-byte random value that appears only in the QR URL and is compared in
  constant time.
- A session accepts **one** upload and is deleted when the desktop takes the
  file.
- Sessions expire after **10 minutes** (`CAPTURE_TTL_MS`). They are swept
  every 60 s.
- Each user has at most **5** open sessions. The oldest is dropped first.
- Only the user who opened the session can see its status or take the file.
- Uploads must match the session's `accept` (extension and MIME type) and be
  **10 MB or smaller** (`CAPTURE_MAX_BYTES`).
- Files are kept in memory only, never written to disk.

---

## Configuration

| Env var          | Needed when                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `PUBLIC_APP_URL` | The web app runs behind a proxy. The QR URL must point at an address the phone can reach. If unset, the URL is built from the request (respecting `x-forwarded-host`). Not used by the desktop app. |
| `CAPTURE_PORT`   | Set by the desktop app only (see below). |

---

## Desktop app (Tauri)

The desktop app runs its own server on `127.0.0.1`, which a phone can't reach,
and the hosted site doesn't share its sessions. So the phone talks to the
desktop directly over Wi-Fi:

```
phone ── http://192.168.x.y:CAPTURE_PORT ──▶ LAN gate (Bun.serve on 0.0.0.0)
                                               │ only /capture/*, /api/capture/*,
                                               │ /assets/*, favicon, manifest
                                               ▼
                                 Nitro app on 127.0.0.1:PORT (same process, same store)
```

- `src-tauri/src/lib.rs` picks both ports and starts `desktop-entry.mjs`,
  which `scripts/prepare-sidecar.sh` copies into `.output/server/`.
- The gate drops cookies both ways and returns 404 for every other path, so
  the rest of the app is never exposed to the network.
- The QR uses the computer's private IPv4 (`server/lan-ip.ts`, Wi-Fi and
  Ethernet first, VPN/Docker/VM adapters skipped). If there is none, the
  dialog shows "Connect this computer to Wi-Fi to use your phone".

Caveats:

- The phone must be on the **same network**. Mobile data won't work.
- Guest, hotel and many office networks block devices from reaching each
  other. Capture can't work there.
- macOS/Windows ask once to allow incoming connections. The user must allow.
- Plain HTTP is fine: the camera opens through a file input, which needs no
  secure context.

---

## Limits and caveats

- **Single server process only.** The store is a `Map` kept on `globalThis`.
  That works on the current Nitro `node-server` deployment. If the app is
  scaled to several instances or moved to serverless, re-implement
  `server/store.ts` on Redis or Upstash. Keep the same functions and nothing
  else changes.
- **Polling, not push.** A 1.5 s poll is cheap and simple. Switch to SSE only
  if that delay becomes a problem.
- One file per session. For several files, the user scans again.

---

## Local testing

A phone cannot open `localhost`.

1. Run `pnpm dev --host`.
2. On the computer, open the app at its network address, e.g.
   `http://192.168.1.20:3000`. The QR URL uses that address. You can set
   `PUBLIC_APP_URL` instead.
3. Put the phone on the same Wi-Fi, open an upload dialog, click
   **Use phone**, and scan.

Unit tests: `pnpm vitest run src/features/phone-capture`

**Manual checklist**

- [ ] A photo taken on the phone appears on the desktop in about 2 s, and the form submits.
- [ ] A PDF from Files and a photo from the gallery both arrive.
- [ ] A file type the form doesn't accept is rejected on the phone.
- [ ] After 10 minutes the desktop shows **Make a new code**, and the phone shows "expired".
- [ ] Opening a link that was already used shows "expired".
- [ ] On a phone, the button opens the camera directly with no QR code.
