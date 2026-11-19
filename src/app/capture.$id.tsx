import { useEffect, useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
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
import {
  getCaptureInfoFn,
  uploadCaptureFn,
} from "@/features/phone-capture/services"
import { objectToFormData } from "@/lib/form-utils"

/** Public page the phone opens from the QR code. No sign-in needed. */
export const Route = createFileRoute("/capture/$id")({
  validateSearch: z.object({ t: z.string().catch("") }),
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: async ({ params, deps }) => {
    if (!deps.t) return null
    try {
      return await getCaptureInfoFn({ data: { id: params.id, token: deps.t } })
    } catch {
      return null
    }
  },
  head: () => ({ meta: [{ title: "Send a file" }] }),
  component: CapturePage,
})

type Step = "pick" | "preview" | "sending" | "done" | "expired"

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
    const picked = event.target.files?.[0]
    event.target.value = ""
    if (!picked || !info) return
    setError(undefined)
    if (!matchesAccept(picked, info.accept)) {
      setError("This type of file is not allowed here.")
      return
    }
    const smaller = await compressImage(picked)
    // Keep the original if the JPEG version would not be accepted
    setFile(matchesAccept(smaller, info.accept) ? smaller : picked)
    setStep("preview")
  }

  async function send() {
    if (!file) return
    setStep("sending")
    setError(undefined)
    try {
      await uploadCaptureFn({ data: objectToFormData({ id, token, file }) })
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
              onClick={() => cameraRef.current?.click()}
            >
              <Camera /> Take photo
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-base"
            onClick={() => pickerRef.current?.click()}
          >
            <FolderOpen /> Choose file
          </Button>
        </div>
      )}

      {(step === "preview" || step === "sending") && file && (
        <div className="flex w-full flex-col gap-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
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
            {step === "sending" ? <Loader2 className="animate-spin" /> : <Send />}
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
