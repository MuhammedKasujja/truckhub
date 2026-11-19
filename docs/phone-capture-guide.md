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
├── services/index.ts                server functions
├── server/store.ts                  in-memory session store (server only)
├── server/store.test.ts
└── lib/
    ├── accept.ts                    matchesAccept(), acceptsImages()
    └── compress-image.ts            client-side photo resize
src/app/capture.$id.tsx              public page the phone opens
```

### `usePhoneCapture({ accept, onFile })`

Returns `{ state, url, expiresAt, start, cancel }`.

`state` is one of `idle | creating | waiting | receiving | expired | error`.
Status is polled with react-query (`refetchInterval: 1500`) only while
`waiting`. The code also expires on the client when `expiresAt` passes.

### Server functions (`services/index.ts`)

| Function                 | Who calls it | Auth                        | Does                                                                 |
| ------------------------ | ------------ | --------------------------- | -------------------------------------------------------------------- |
| `createCaptureSessionFn` | desktop      | signed-in user (session)    | Creates a session and returns `{ id, url, expiresAt }`.              |
| `getCaptureStatusFn`     | desktop      | session owner only          | Returns `pending`, `ready` or `expired`.                             |
| `takeCaptureFileFn`      | desktop      | session owner only          | Returns the bytes as a `Response` once, then deletes the session.    |
| `cancelCaptureSessionFn` | desktop      | session owner only          | Deletes the session when the dialog is closed.                       |
| `getCaptureInfoFn`       | phone        | upload token                | Returns `{ accept, expiresAt }`, or `null` when the link is dead.    |
| `uploadCaptureFn`        | phone        | upload token                | FormData `{ id, token, file }`. Checks type and size, then stores it.|

> These functions must **not** use `apiClient`. Its interceptor adds the
> signed-in user's FastAPI token, and the phone has no session.

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

- The session id is `crypto.randomUUID()`. The upload token is a separate
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
| `PUBLIC_APP_URL` | The app runs behind a proxy, or in the Tauri desktop build. The QR URL must point at an address the phone can reach. If unset, the URL is built from the request (respecting `x-forwarded-host`). |

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
