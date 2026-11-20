import {
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { Camera, Trash2, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { SUPPORTED_IMAGE_EXTENSIONS } from "@/config/constants"

/**
 * Value semantics:
 *   undefined -> unchanged (show `src`)
 *   null      -> removed   (show fallback initials)
 *   File      -> new, cropped image
 */
export type AvatarValue = File | null | undefined

/** An extra entry in the avatar's menu, e.g. "Use phone". */
export type AvatarExtraAction = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
  /** Kept mounted outside the menu (dialogs, hidden inputs). */
  element?: React.ReactNode
}

export type AvatarUploaderHandle = {
  /** Runs a file through the same checks and crop dialog as one picked from disk. */
  pickFile: (file: File) => void
}

export type AvatarUploaderProps = {
  value?: AvatarValue
  onChange: (value: AvatarValue) => void
  /** Saved avatar URL, shown while value is undefined */
  src?: string | null
  /** Used for the fallback initials */
  name?: string
  maxSizeMB?: number
  disabled?: boolean
  /** circle, rounded (square with soft corners) or square (sharp corners) */
  shape?: "circle" | "rounded" | "square"
  /** Width and height of the image in px */
  size?: number
  className?: string
  /**
   * Extra entries in the avatar's menu. Use `ref.pickFile` to send the file
   * they produce through the crop dialog.
   */
  extraActions?: AvatarExtraAction[]
  ref?: React.Ref<AvatarUploaderHandle>
  // forwarded by shadcn's <FormControl> so labels and errors link up
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

const OUTPUT_SIZE = 512 // final avatar is 512x512
const PREVIEW_SIZE = 280 // crop box size on screen

function initials(name?: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function AvatarUploader({
  value,
  onChange,
  src,
  name,
  maxSizeMB = 5,
  disabled,
  shape = "circle",
  size = 100,
  className,
  extraActions = [],
  ref,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: AvatarUploaderProps) {
  // full class names so Tailwind can see them
  const radius = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
    square: "rounded-none",
  }[shape]
  // newer shadcn Avatar draws a circular border with an ::after element
  const afterRadius = {
    circle: "after:rounded-full",
    rounded: "after:rounded-2xl",
    square: "after:rounded-none",
  }[shape]

  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [raw, setRaw] = useState<string | null>(null) // image being cropped
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
    setRaw(URL.createObjectURL(file))
    setZoom(1)
    setPos({ x: 0, y: 0 })
    setOpen(true)
  }

  useImperativeHandle(ref, () => ({ pickFile: pick }))

  // base scale so the image always covers the crop box
  const baseScale = () => {
    const img = imgRef.current
    if (!img) return 1
    return PREVIEW_SIZE / Math.min(img.naturalWidth, img.naturalHeight)
  }

  // keep the image from leaving the crop box
  const clamp = (p: { x: number; y: number }, z = zoom) => {
    const img = imgRef.current
    if (!img) return p
    const s = baseScale() * z
    const maxX = Math.max(0, (img.naturalWidth * s - PREVIEW_SIZE) / 2)
    const maxY = Math.max(0, (img.naturalHeight * s - PREVIEW_SIZE) / 2)
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
    const sw = PREVIEW_SIZE / s
    const sx = img.naturalWidth / 2 - sw / 2 - pos.x / s
    const sy = img.naturalHeight / 2 - sw / 2 - pos.y / s

    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = OUTPUT_SIZE
    canvas
      .getContext("2d")!
      .drawImage(img, sx, sy, sw, sw, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    canvas.toBlob(
      (blob) => {
        if (!blob) return setError("Couldn't process that image. Try another.")
        onChange(new File([blob], "avatar.jpg", { type: "image/jpeg" }))
        setOpen(false)
      },
      "image/jpeg",
      0.9
    )
  }

  const openFilePicker = () => inputRef.current?.click()
  // a menu with only "upload" in it is pointless; click straight through
  const menu = extraActions.length > 0 || !!display

  const avatarButton = (
    <button
      id={id}
      type="button"
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      aria-label="Change profile picture"
      onClick={menu ? undefined : openFilePicker}
      className={cn(
        "group relative focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:opacity-50",
        radius,
        ariaInvalid && "ring-2 ring-destructive"
      )}
    >
      <Avatar
        className={cn("shrink-0", radius, afterRadius)}
        style={{ width: size, height: size }}
      >
        {display && (
          <AvatarImage
            src={display}
            alt={name ?? "Profile picture"}
            className={cn("aspect-square h-full w-full object-cover", radius)}
          />
        )}
        <AvatarFallback className={cn("text-xl", radius)}>
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
          radius
        )}
      >
        <Camera className="h-6 w-6 text-white" />
      </span>
      <span
        aria-hidden
        className="absolute right-0.5 bottom-0.5 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background group-disabled:hidden"
      >
        <Camera className="size-3.5" />
      </span>
    </button>
  )

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_IMAGE_EXTENSIONS.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = "" // allow re-picking the same file
        }}
      />

      {/* Avatar; opens a menu when there's more than "upload" to offer */}
      {menu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            {avatarButton}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuItem onSelect={openFilePicker}>
              <Upload />
              Upload from computer
            </DropdownMenuItem>
            {extraActions.map((action) => (
              <DropdownMenuItem key={action.id} onSelect={action.onSelect}>
                <action.icon />
                {action.label}
              </DropdownMenuItem>
            ))}
            {display && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onChange(null)}
                >
                  <Trash2 />
                  Remove photo
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        avatarButton
      )}
      {extraActions.map((action) => (
        <Fragment key={action.id}>{action.element}</Fragment>
      ))}

      <div className="space-y-1">
        <p className="text-sm font-medium">
          {display ? "Select the photo to change it" : "Add a photo"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WEBP. Max {maxSizeMB}MB.
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Crop dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust your photo</DialogTitle>
            <DialogDescription>
              Drag to reposition. Use the slider to zoom.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "relative cursor-grab touch-none overflow-hidden bg-muted select-none active:cursor-grabbing",
                radius
              )}
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
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
              Save photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
