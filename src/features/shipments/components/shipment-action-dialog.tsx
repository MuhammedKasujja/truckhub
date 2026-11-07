import React from "react"
import { Loader2, Truck, UserRound } from "lucide-react"
import { tripRoute } from "../format"
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
  tone?: "default" | "success"
  className?: string
  children: React.ReactNode
}

/**
 * Shared shell for shipment workflow dialogs: icon header, the trip it acts
 * on, a scrollable body (the form) and a consistent footer.
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
  tone = "default",
  className,
  children,
}: ShipmentActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          className
        )}
      >
        <DialogHeader className="flex-row items-start gap-3 border-b p-5 pr-12 text-left">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              tone === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {shipment && <ShipmentContextStrip shipment={shipment} />}
          {children}
        </div>

        <DialogFooter className="mx-0 mb-0 border-t p-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShipmentContextStrip({ shipment }: { shipment: Shipment }) {
  const route = tripRoute(shipment)
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          {shipment.number ?? "Unnumbered shipment"}
        </span>
        {route && (
          <span className="truncate text-xs text-muted-foreground">
            {route.origin} → {route.destination}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Truck className="size-3.5" />
          {shipment.vehicle?.plate_number ?? "No vehicle"}
        </span>
        <span className="inline-flex items-center gap-1">
          <UserRound className="size-3.5" />
          {shipment.driver?.fullname ?? "No driver"}
        </span>
      </div>
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
