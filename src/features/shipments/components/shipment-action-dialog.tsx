import React from "react"
import { Loader2, MapPin, UserRound } from "lucide-react"
import { tripRoute } from "../format"
import { HUE } from "./shipment-hues"
import type { Hue } from "./shipment-hues"
import type { Shipment } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlateNumber } from "@/features/vehicles/components/vehicle-visuals"
import { formatNumber, generateAvatorFallback } from "@/lib/format"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

type ShipmentActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment?: Shipment
  icon: IconType
  title: string
  description?: string
  formId: string
  submitLabel: string
  isSubmitting?: boolean
  hue?: Hue
  className?: string
  children: React.ReactNode
}

/**
 * Shared shell for shipment workflow dialogs: tinted icon header, the trip it
 * acts on, a scrollable body (the form) and a consistent footer.
 */
export function ShipmentActionDialog({
  open,
  onOpenChange,
  shipment,
  icon: Icon,
  title,
  description,
  formId,
  submitLabel,
  isSubmitting = false,
  hue = "blue",
  className,
  children,
}: ShipmentActionDialogProps) {
  const palette = HUE[hue]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          className
        )}
      >
        <div className="relative shrink-0 overflow-hidden border-b">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent",
              palette.glow
            )}
          />
          <DialogHeader className="relative flex-row items-center gap-4 p-5 pr-12 text-left">
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-xs ring-1 ring-foreground/5",
                palette.tile
              )}
            >
              <Icon className="size-6" />
            </div>
            <div className="min-w-0 space-y-1">
              {shipment?.number && (
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {shipment.number}
                </p>
              )}
              <DialogTitle className="text-lg font-bold tracking-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-5">
          {shipment && <ShipmentContextCard shipment={shipment} />}
          {children}
        </div>

        <DialogFooter className="mx-0 mb-0 border-t bg-background p-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Icon className="size-4" />
            )}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Compact card showing the trip a dialog acts on. */
function ShipmentContextCard({ shipment }: { shipment: Shipment }) {
  const route = tripRoute(shipment)
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      {route && (
        <div className="flex items-center gap-2 px-3.5 pt-3 text-sm">
          <span className="size-2.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span className="truncate font-medium" title={route.origin}>
            {route.origin}
          </span>
          <span className="h-px min-w-6 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-border)_0_5px,transparent_5px_9px)]" />
          <MapPin className="size-4 shrink-0 text-destructive" />
          <span className="truncate font-medium" title={route.destination}>
            {route.destination}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-3.5 py-3">
        {shipment.vehicle ? (
          <PlateNumber value={shipment.vehicle.plate_number} />
        ) : (
          <span className="rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
            No vehicle
          </span>
        )}
        <span className="flex min-w-0 items-center gap-2 text-sm">
          {shipment.driver ? (
            <>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[10px] font-bold text-violet-700 uppercase dark:text-violet-300">
                {generateAvatorFallback(shipment.driver.fullname)}
              </span>
              <span className="truncate">{shipment.driver.fullname}</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <UserRound className="size-3.5" />
              No driver
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

/** A titled card grouping related fields inside a dialog. */
export function FormSection({
  icon: Icon,
  hue = "slate",
  title,
  description,
  action,
  children,
  className,
}: {
  icon: IconType
  hue?: Hue
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn("rounded-xl border bg-card p-4 shadow-xs", className)}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg",
              HUE[hue].tile
            )}
          >
            <Icon className="size-4" />
          </span>
          <div>
            <h3 className="text-sm leading-7 font-semibold">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Digital-style odometer readout. */
export function OdometerReading({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string | number | null | undefined
  muted?: boolean
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "rounded-lg px-3 py-2 font-mono text-lg font-semibold tracking-widest tabular-nums shadow-inner",
          muted
            ? "border border-dashed bg-muted text-muted-foreground"
            : "bg-foreground text-background"
        )}
      >
        {formatNumber(value, { fallback: "——" })}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

/** Highlighted result row, e.g. a computed total. */
export function ResultBanner({
  hue = "blue",
  label,
  hint,
  value,
}: {
  hue?: Hue
  label: string
  hint?: string
  value: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
        HUE[hue].soft
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <p className={cn("text-lg font-bold tabular-nums", HUE[hue].text)}>
        {value}
      </p>
    </div>
  )
}

/** Runs a mutation and closes the dialog only when it succeeds. */
export async function closeOnSuccess(
  action: () => Promise<unknown> | undefined,
  close: () => void
) {
  try {
    await action()
    close()
  } catch {
    // errors are already surfaced as a toast by the action hook
  }
}
