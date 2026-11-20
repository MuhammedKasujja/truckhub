import { useEffect, useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { createIsomorphicFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  Camera,
  CheckCircle2,
  FileText,
  FolderOpen,
  Loader2,
  Send,
  TimerOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { matchesAccept } from "@/features/phone-capture/lib/accept"
import { compressImage } from "@/features/phone-capture/lib/compress-image"
import { getCaptureInfoFn } from "@/features/phone-capture/services"
import { objectToFormData } from "@/lib/form-utils"

type CaptureInfo = { accept: string; expiresAt: number }

const captureApi = (id: string) => `/api/capture/${encodeURIComponent(id)}`

/*
 * The phone talks to /api/capture/$id, not to server functions: in the
 * desktop app it reaches this page through a LAN gate that lets only those
 * paths through. The first render happens on the server, so the loader calls
 * the session store directly there.
 */
const loadCaptureInfo = createIsomorphicFn()
  .server((id: string, token: string) =>
    getCaptureInfoFn({ data: { id, token } })
  )
  .client(async (id: string, token: string): Promise<CaptureInfo | null> => {
    const response = await fetch(`${captureApi(id)}?t=${encodeURIComponent(token)}`)
    return response.ok ? response.json() : null
  })

async function uploadCapture(id: string, token: string, file: File) {
  const response = await fetch(captureApi(id), {
    method: "POST",
    body: objectToFormData({ token, file }),
  })
  if (response.ok) return
  const body = (await response.json().catch(() => ({}))) as { message?: string }
  throw new Error(body.message ?? "")
}

/** Public page the phone opens from the QR code. No sign-in needed. */
export const Route = createFileRoute("/capture/$id")({
  validateSearch: z.object({ t: z.string().catch("") }),
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: async ({ params, deps }) => {
    if (!deps.t) return null
    try {
      return await loadCaptureInfo(params.id, deps.t)
    } catch {
      return null
    }
  },
  head: () => ({ meta: [{ title: "Send a file" }] }),
  component: CapturePage,
})

type Step = "pick" | "processing" | "preview" | "sending" | "done" | "expired"

/**
 * Set when the camera or file picker opens, cleared when a file comes back.
 * If it is still set on load, the phone dropped the page while the camera was
 * open (Android does this when low on memory) and the photo was lost.
 */
const pendingKey = (id: string) => `capture-pending:${id}`

function readPending(id: string) {
  try {
    const pending = sessionStorage.getItem(pendingKey(id)) === "1"
    sessionStorage.removeItem(pendingKey(id))
    return pending
  } catch {
    return false
  }
}

function writePending(id: string, pending: boolean) {
  try {
    if (pending) sessionStorage.setItem(pendingKey(id), "1")
    else sessionStorage.removeItem(pendingKey(id))
  } catch {
    // Storage blocked: the reload hint just won't show
  }
}

/** Some phone pickers (Google Drive, file managers) give no MIME type. */
const TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
}

function withGuessedType(file: File) {
  if (file.type) return file
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  const type = TYPE_BY_EXTENSION[extension]
  return type
    ? new File([file], file.name, { type, lastModified: file.lastModified })
    : file
}

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`

function CapturePage() {
  const info = Route.useLoaderData()
  const { id } = Route.useParams()
  const { t: token } = Route.useSearch()

  const [step, setStep] = useState<Step>(info ? "pick" : "expired")
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const cameraRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(undefined)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (readPending(id)) {
      setError(
        "Your phone reloaded this page while the camera or file picker was open, so your file didn't come through. Close other apps and try again, or use Choose file."
      )
    }
  }, [id])

  // Closing the picker without choosing is not a lost photo
  useEffect(() => {
    const inputs = [cameraRef.current, pickerRef.current]
    const clear = () => writePending(id, false)
    inputs.forEach((input) => input?.addEventListener("cancel", clear))
    return () =>
      inputs.forEach((input) => input?.removeEventListener("cancel", clear))
  }, [id, step])

  // The link dies after its time limit even if the page stays open
  useEffect(() => {
    if (!info || step === "done") return
    const timer = setTimeout(
      () => setStep("expired"),
      Math.max(0, info.expiresAt - Date.now())
    )
    return () => clearTimeout(timer)
  }, [info, step])

  if (!info || step === "expired") {
    return (
      <Shell>
        <TimerOff className="size-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">This link has expired</h1>
        <p className="text-sm text-muted-foreground">
          Make a new code on your computer and scan it again.
        </p>
      </Shell>
    )
  }

  if (step === "done") {
    return (
      <Shell>
        <CheckCircle2 className="size-12 text-emerald-600" />
        <h1 className="text-lg font-semibold">Sent</h1>
        <p className="text-sm text-muted-foreground">
          Check your computer. You can close this page.
        </p>
      </Shell>
    )
  }

  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.files?.[0]
    event.target.value = ""
    const picked = raw && withGuessedType(raw)
    writePending(id, false)
    if (!picked || !info) return
    setError(undefined)
    if (!matchesAccept(picked, info.accept)) {
      setError("This type of file is not allowed here.")
      return
    }
    // Shrinking a big photo can take a few seconds on a phone, so show that
    // something is happening instead of leaving the pick buttons up
    setStep("processing")
    let chosen = picked
    try {
      const smaller = await compressImage(picked)
      // Keep the original if the JPEG version would not be accepted
      if (matchesAccept(smaller, info.accept)) chosen = smaller
    } catch {
      // Send the original
    }
    setFile(chosen)
    setStep("preview")
  }

  function openPicker(input: HTMLInputElement | null) {
    if (!input) return
    writePending(id, true)
    input.click()
  }

  async function send() {
    if (!file) return
    setStep("sending")
    setError(undefined)
    try {
      await uploadCapture(id, token, file)
      setStep("done")
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      if (/expired/i.test(message)) {
        setStep("expired")
        return
      }
      setError(message || "Could not send the file. Try again.")
      setStep("preview")
    }
  }

  const allowsPhotos = matchesAccept(
    { name: "photo.jpg", type: "image/jpeg" },
    info.accept
  )

  return (
    <Shell>
      <h1 className="text-lg font-semibold">Send a file to your computer</h1>

      {step === "pick" && (
        <div className="flex w-full flex-col gap-3">
          {allowsPhotos && (
            <Button
              size="lg"
              className="h-14 text-base"
              onClick={() => openPicker(cameraRef.current)}
            >
              <Camera /> Take photo
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-base"
            onClick={() => openPicker(pickerRef.current)}
          >
            <FolderOpen /> Choose file
          </Button>
        </div>
      )}

      {step === "processing" && (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Preparing file…
        </div>
      )}

      {(step === "preview" || step === "sending") && file && (
        <div className="flex w-full flex-col gap-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              // Some images (HEIC on Android) can't be shown: fall back to the name card
              onError={() => setPreviewUrl(undefined)}
              className="max-h-[55svh] w-full rounded-xl border object-contain"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border p-4 text-left">
              <FileText className="size-8 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {sizeLabel(file.size)}
                </p>
              </div>
            </div>
          )}
          <Button
            size="lg"
            className="h-14 text-base"
            disabled={step === "sending"}
            onClick={send}
          >
            {step === "sending" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            {step === "sending" ? "Sending…" : "Send to computer"}
          </Button>
          <Button
            variant="ghost"
            disabled={step === "sending"}
            onClick={() => {
              setFile(undefined)
              setStep("pick")
            }}
          >
            Choose a different one
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={choose}
      />
      <input
        ref={pickerRef}
        type="file"
        accept={info.accept}
        className="sr-only"
        tabIndex={-1}
        onChange={choose}
      />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-background p-6 text-center shadow-sm">
        {children}
      </div>
    </main>
  )
}
