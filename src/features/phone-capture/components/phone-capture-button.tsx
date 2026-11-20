import { useEffect, useRef, useState } from "react"
import { Camera, Loader2, RefreshCw, Smartphone } from "lucide-react"
import { usePhoneCapture } from "../hooks/use-phone-capture"
import { acceptsImages } from "../lib/accept"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrCode, QrCodeFrame } from "@/components/ui/qr-code"

type Props = {
  onFile: (file: File) => void
  /** Same value as the file input's `accept`. */
  accept?: string
  label?: string
  className?: string
}

function useIsTouchDevice() {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)")
    setTouch(query.matches)
    const update = () => setTouch(query.matches)
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return touch
}

function useSecondsLeft(expiresAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!expiresAt) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])
  return expiresAt ? Math.max(0, Math.round((expiresAt - now) / 1000)) : 0
}

const mmss = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

export type PhoneCaptureAction = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Opens the QR dialog (computer) or the camera (phone). */
  start: () => void
  /** Dialog or hidden input; keep it mounted wherever the trigger lives. */
  element: React.ReactNode
}

/**
 * The phone-capture action without its button, for menus and custom
 * triggers. On a computer it shows a QR code so a phone can take a photo or
 * pick a file and send it here. On a phone it opens the camera directly
 * (the form's own file input already covers the gallery and files), and
 * returns null when `accept` takes no images.
 */
export function usePhoneCaptureAction({
  onFile,
  accept = "image/*,application/pdf",
  label = "Use phone",
}: Omit<Props, "className">): PhoneCaptureAction | null {
  const isTouch = useIsTouchDevice()
  const onFileRef = useRef(onFile)
  useEffect(() => {
    onFileRef.current = onFile
  })

  const cameraRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const capture = usePhoneCapture({
    accept,
    onFile: (file) => {
      setOpen(false)
      onFileRef.current(file)
    },
  })
  const secondsLeft = useSecondsLeft(capture.expiresAt)

  if (isTouch) {
    if (!acceptsImages(accept)) return null
    return {
      label: "Take photo",
      icon: Camera,
      start: () => cameraRef.current?.click(),
      element: (
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) onFileRef.current(file)
          }}
        />
      ),
    }
  }

  function close() {
    setOpen(false)
    capture.cancel()
  }

  return {
    label,
    icon: Smartphone,
    start: () => {
      setOpen(true)
      capture.start()
    },
    element: (
      <Dialog open={open} onOpenChange={(next) => !next && close()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Send a file from your phone</DialogTitle>
            <DialogDescription>
              Scan this code with your phone camera, then take a photo or choose
              a file. It will appear here.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {capture.state === "waiting" && capture.url ? (
              <>
                <QrCode
                  value={capture.url}
                  encoding={{ ecc: "M" }}
                  className="[--qr-code-size:--spacing(56)]"
                >
                  <QrCodeFrame className="border p-2" />
                </QrCode>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Waiting for your phone ·{" "}
                  <span className="tabular-nums">{mmss(secondsLeft)}</span>
                </p>
                {capture.sameWifi && (
                  <p className="text-center text-xs text-muted-foreground">
                    Your phone must be on the same Wi-Fi as this computer.
                  </p>
                )}
              </>
            ) : capture.state === "expired" || capture.state === "error" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {capture.state === "expired"
                    ? "This code has expired."
                    : capture.error || "Something went wrong."}
                </p>
                <Button type="button" onClick={capture.start}>
                  <RefreshCw /> Make a new code
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                {capture.state === "receiving"
                  ? "Receiving file…"
                  : "Preparing code…"}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    ),
  }
}

/**
 * On a computer: shows a QR code so a phone can take a photo or pick a file
 * and send it here. On a phone: opens the camera directly.
 */
export function PhoneCaptureButton({ className, ...props }: Props) {
  const action = usePhoneCaptureAction(props)
  if (!action) return null
  const Icon = action.icon
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={action.start}
      >
        <Icon /> {action.label}
      </Button>
      {action.element}
    </>
  )
}
