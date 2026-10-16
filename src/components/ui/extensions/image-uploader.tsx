import { useEffect, useRef, useState } from "react"
import { Camera, ImagePlus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

/**
 * Value semantics:
 *   undefined -> unchanged (show `src`)
 *   null      -> removed   (show empty state)
 *   File      -> new, cropped image
 */
export type ImageValue = File | null | undefined

export type ImageUploaderProps = {
  value?: ImageValue
  onChange: (value: ImageValue) => void
  /** Saved image URL, shown while value is undefined */
  src?: string | null
  /** Width / height. 1 = square, 16 / 9 = landscape, 3 / 4 = portrait */
  aspect?: number
  /** Display width in px, or "full" to fill the parent (height follows the aspect ratio) */
  width?: number | "full"
  /** Long side of the saved image in px */
  outputSize?: number
  /** Corner style. "full" only makes sense when aspect is 1 */
  radius?: "none" | "md" | "xl" | "full"
  maxSizeMB?: number
  disabled?: boolean
  className?: string
  // forwarded by form wrappers so labels and errors link up
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

const CROP_MAX = 320 // long side of the crop box on screen

const RADIUS = {
  none: "rounded-none",
  md: "rounded-lg",
  xl: "rounded-2xl",
  full: "rounded-full",
} as const

export function ImageUploader({
  value,
  onChange,
  src,
  aspect = 1,
  width = 240,
  outputSize = 1024,
  radius = "md",
  maxSizeMB = 5,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: ImageUploaderProps) {
  const r = RADIUS[radius === "full" && aspect !== 1 ? "xl" : radius]

  // crop box and output dimensions follow the aspect ratio
  const cropW = aspect >= 1 ? CROP_MAX : CROP_MAX * aspect
  const cropH = aspect >= 1 ? CROP_MAX / aspect : CROP_MAX
  const outW = Math.round(aspect >= 1 ? outputSize : outputSize * aspect)
  const outH = Math.round(outW / aspect)

  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [raw, setRaw] = useState<string | null>(null) // image being cropped
  const rawType = useRef("image/jpeg") // mime type of the picked file
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // crop state
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number } | null>(null)

  // preview URL for a File value
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!(value instanceof File)) return setFileUrl(null)
    const url = URL.createObjectURL(value)
    setFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  // free the crop source URL
  useEffect(() => {
    return () => {
      if (raw) URL.revokeObjectURL(raw)
    }
  }, [raw])

  const display =
    value === null ? null : value instanceof File ? fileUrl : (src ?? null)

  const pick = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/"))
      return setError("Choose an image file.")
    if (file.size > maxSizeMB * 1024 * 1024)
      return setError(`Image must be under ${maxSizeMB}MB.`)
    setError(null)
    rawType.current = file.type
    setRaw(URL.createObjectURL(file))
    setZoom(1)
    setPos({ x: 0, y: 0 })
    setOpen(true)
  }

  // base scale so the image always covers the crop box
  const baseScale = () => {
    const img = imgRef.current
    if (!img) return 1
    return Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight)
  }

  // keep the image from leaving the crop box
  const clamp = (p: { x: number; y: number }, z = zoom) => {
    const img = imgRef.current
    if (!img) return p
    const s = baseScale() * z
    const maxX = Math.max(0, (img.naturalWidth * s - cropW) / 2)
    const maxY = Math.max(0, (img.naturalHeight * s - cropH) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, p.x)),
      y: Math.min(maxY, Math.max(-maxY, p.y)),
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setPos(
      clamp({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
    )
  }
  const onPointerUp = () => (drag.current = null)

  const save = () => {
    const img = imgRef.current
    if (!img) return

    const s = baseScale() * zoom
    // visible region of the source image, in natural pixels
    const sw = cropW / s
    const sh = cropH / s
    const sx = img.naturalWidth / 2 - sw / 2 - pos.x / s
    const sy = img.naturalHeight / 2 - sh / 2 - pos.y / s

    const canvas = document.createElement("canvas")
    canvas.width = outW
    canvas.height = outH
    canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)

    // JPEG stays JPEG. PNG/WebP keep their transparency (saved as WebP, or PNG
    // on browsers that can't encode WebP), so nothing gets a baked-in background.
    const type = rawType.current === "image/jpeg" ? "image/jpeg" : "image/webp"

    canvas.toBlob(
      (blob) => {
        if (!blob) return setError("Couldn't process that image. Try another.")
        const ext =
          blob.type === "image/jpeg"
            ? "jpg"
            : blob.type === "image/webp"
              ? "webp"
              : "png"
        onChange(new File([blob], `image.${ext}`, { type: blob.type }))
        setOpen(false)
      },
      type,
      0.9
    )
  }

  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = "" // allow re-picking the same file
        }}
      />

      {/* Image box (or empty state) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={display ? "Change image" : "Add image"}
        onClick={() => inputRef.current?.click()}
        style={{
          width: width === "full" ? "100%" : width,
          maxWidth: "100%",
          aspectRatio: aspect,
        }}
        className={cn(
          "group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:opacity-50",
          r,
          display
            ? "border bg-muted"
            : "border-2 border-dashed bg-muted/40 hover:border-primary/60 hover:bg-muted/60",
          ariaInvalid && "border-destructive ring-1 ring-destructive"
        )}
      >
        {display ? (
          <>
            <img src={display} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </span>
          </>
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImagePlus className="h-7 w-7" />
            <span className="text-sm">Click to add image</span>
          </span>
        )}
      </button>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {display ? "Change image" : "Upload image"}
          </Button>
          {display && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WEBP. Max {maxSizeMB}MB.
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Crop dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust your image</DialogTitle>
            <DialogDescription>
              Drag to reposition. Use the slider to zoom.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "relative cursor-grab touch-none overflow-hidden bg-muted select-none active:cursor-grabbing",
                r
              )}
              style={{ width: cropW, height: cropH }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {raw && (
                <img
                  ref={imgRef}
                  src={raw}
                  alt="Crop preview"
                  draggable={false}
                  onLoad={() => setPos({ x: 0, y: 0 })}
                  className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
                  style={{
                    transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${baseScale() * zoom})`,
                    transformOrigin: "center",
                  }}
                />
              )}
            </div>

            <Slider
              className="w-full"
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={([z]) => {
                setZoom(z)
                setPos((p) => clamp(p, z))
              }}
              aria-label="Zoom"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
