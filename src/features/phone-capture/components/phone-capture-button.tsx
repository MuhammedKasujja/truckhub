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

/**
 * On a computer: shows a QR code so a phone can take a photo or pick a file
 * and send it here. On a phone: opens the camera or file picker directly.
 */
export function PhoneCaptureButton({
  onFile,
  accept = "image/*,application/pdf",
  label = "Use phone",
  className,
}: Props) {
  const isTouch = useIsTouchDevice()
  if (isTouch) {
    return (
      <OnDeviceCamera onFile={onFile} accept={accept} className={className} />
    )
  }
  return (
    <QrHandOff
      onFile={onFile}
      accept={accept}
      label={label}
      className={className}
    />
  )
}

/**
 * On a phone the form's own file input already opens the gallery and files,
 * so only a direct "Take photo" shortcut is added.
 */
function OnDeviceCamera({
  onFile,
  accept,
  className,
}: {
  onFile: (file: File) => void
  accept: string
  className?: string
}) {
  const cameraRef = useRef<HTMLInputElement>(null)
  if (!acceptsImages(accept)) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={() => cameraRef.current?.click()}
      >
        <Camera /> Take photo
      </Button>
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
          if (file) onFile(file)
        }}
      />
    </>
  )
}

function QrHandOff({
  onFile,
  accept,
  label,
  className,
}: Required<Omit<Props, "className">> & { className?: string }) {
  const [open, setOpen] = useState(false)
  const capture = usePhoneCapture({
    accept,
    onFile: (file) => {
      setOpen(false)
      onFile(file)
    },
  })
  const secondsLeft = useSecondsLeft(capture.expiresAt)

  function openDialog() {
    setOpen(true)
    capture.start()
  }

  function close() {
    setOpen(false)
    capture.cancel()
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={openDialog}
      >
        <Smartphone /> {label}
      </Button>

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
              </>
            ) : capture.state === "expired" || capture.state === "error" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {capture.state === "expired"
                    ? "This code has expired."
                    : "Something went wrong."}
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
    </>
  )
}
