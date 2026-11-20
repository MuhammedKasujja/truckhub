import { CarFrontIcon, TruckIcon } from "lucide-react"
import { humanize } from "../format"
import { CAR_COLOR_OPTIONS } from "@/common/config"
import { cn } from "@/lib/utils"

/** License-plate styled chip. */
export function PlateNumber({
  value,
  size = "default",
  className,
}: {
  value: string
  size?: "default" | "lg"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border-2 border-foreground/80 bg-background font-mono font-semibold tracking-widest uppercase shadow-xs",
        size === "lg" ? "px-2.5 py-1 text-base" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      {value}
    </span>
  )
}

const COLOR_BY_VALUE = new Map(
  CAR_COLOR_OPTIONS.map((option) => [option.value, option])
)

/** Resolves a stored color key (e.g. "pearlWhite") via CAR_COLOR_OPTIONS. */
export function carColor(value: string | null | undefined) {
  const option = value ? COLOR_BY_VALUE.get(value) : undefined
  return {
    label: option?.label ?? humanize(value),
    hex: option?.hex as string | undefined,
  }
}

/** Swatch dot; unknown colors render as an empty outlined dot. */
export function ColorDot({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const { hex } = carColor(name)

  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-3.5 shrink-0 rounded-full border border-border shadow-xs",
        className
      )}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  )
}

export function ColorValue({ name }: { name: string }) {
  if (!name) return <span className="text-muted-foreground">-</span>
  return (
    <span className="inline-flex items-center gap-2">
      <ColorDot name={name} />
      {carColor(name).label}
    </span>
  )
}

/** Rounded icon tile showing a truck or car depending on the category. */
export function VehicleIconTile({
  isTruck,
  size = "default",
  className,
}: {
  isTruck: boolean
  size?: "default" | "lg"
  className?: string
}) {
  const Icon = isTruck ? TruckIcon : CarFrontIcon
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
        size === "lg" ? "size-14 [&_svg]:size-7" : "size-10 [&_svg]:size-5",
        className
      )}
    >
      <Icon aria-hidden />
    </div>
  )
}
