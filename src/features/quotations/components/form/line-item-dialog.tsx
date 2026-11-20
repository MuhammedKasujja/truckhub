import React from "react"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Check, PackageOpen, Plus, Repeat } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

type LineItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: IconType
  title: string
  description: string
  /** True when editing an existing line item rather than adding one. */
  isEditing?: boolean
  lineTotal?: string | number | null
  /** Optional chip shown before the submit button, e.g. "2 routes". */
  footerNote?: React.ReactNode
  onSubmit: () => void
  /** The catalogue the user picks a price from. */
  picker: React.ReactNode
  /** Heading above the catalogue; omit when the picker has its own. */
  pickerTitle?: string
  pickerDescription?: string
  pickerAction?: React.ReactNode
  /** Configuration + totals for the line item. */
  children: React.ReactNode
  totals: React.ReactNode
}

/**
 * Shared shell for the quotation line-item dialogs: header with the running
 * total, a large catalogue pane on the left and the line configuration on the
 * right with the totals pinned to the bottom.
 */
export function LineItemDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  isEditing,
  lineTotal,
  footerNote,
  onSubmit,
  picker,
  pickerTitle,
  pickerDescription,
  pickerAction,
  children,
  totals,
}: LineItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[95vw]">
        <form
          className="flex min-h-0 w-full flex-1 flex-col"
          onSubmit={(e) => {
            // Dialogs are portalled but React events still bubble through the
            // component tree, so keep this from reaching the quotation form.
            e.preventDefault()
            e.stopPropagation()
            onSubmit()
          }}
        >
          {/* Header */}
          <DialogHeader className="shrink-0 flex-row items-center gap-4 border-b px-6 py-4 pr-14 text-left">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {isEditing ? "Edit line item" : "New line item"}
              </p>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="truncate">
                {description}
              </DialogDescription>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Line total
              </p>
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {formatMoney(lineTotal ?? 0)}
              </p>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="flex min-h-0 flex-col overflow-hidden">
              {(pickerTitle || pickerAction) && (
                <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 px-6 pt-5 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold">{pickerTitle}</h3>
                    {pickerDescription && (
                      <p className="text-xs text-muted-foreground">
                        {pickerDescription}
                      </p>
                    )}
                  </div>
                  {pickerAction}
                </div>
              )}
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto px-6 pb-6",
                  !(pickerTitle || pickerAction) && "pt-5"
                )}
              >
                {picker}
              </div>
            </div>

            <aside className="flex min-h-0 flex-col overflow-hidden border-t bg-muted/30 lg:border-t-0 lg:border-l">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                {children}
              </div>
              <div className="shrink-0 border-t bg-background p-5">
                {totals}
              </div>
            </aside>
          </div>

          {/* Footer */}
          <DialogFooter className="mx-0 mb-0 shrink-0 items-center border-t bg-background px-6 py-3.5">
            <div className="mr-auto hidden text-sm text-muted-foreground sm:block">
              {footerNote}
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="shadow-sm">
              {isEditing ? <Check /> : <Plus />}
              {isEditing ? "Update item" : "Add to quote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** A titled group of fields inside the configuration pane. */
export function ConfigSection({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon?: IconType
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
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {Icon && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </span>
          )}
          <div>
            <h3 className="text-sm leading-7 font-semibold">{title}</h3>
            {description && (
              <p className="-mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Card-style round trip switch; doubles the line when on. */
export function RoundTripField<T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>
  name: Path<T>
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const checked = Boolean(field.value)
        return (
          <label
            htmlFor={field.name}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs transition-colors",
              checked && "border-primary/40 bg-primary/5"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
                checked && "bg-primary text-primary-foreground"
              )}
            >
              <Repeat className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Round trip</span>
              <span className="block text-xs text-muted-foreground">
                Charge the return leg too (×2)
              </span>
            </span>
            <Switch
              id={field.name}
              checked={checked}
              onCheckedChange={(state) => field.onChange(state)}
            />
          </label>
        )
      }}
    />
  )
}

/** Subtotal → discount → line total breakdown. */
export function LineTotals({
  subtotal,
  discount,
  lineTotal,
  isRoundTrip,
  children,
}: {
  subtotal?: string | number | null
  discount?: string | number | null
  lineTotal?: string | number | null
  isRoundTrip?: boolean | null
  /** Price inputs shown above the breakdown. */
  children?: React.ReactNode
}) {
  const hasDiscount = Number(discount ?? 0) > 0
  return (
    <div className="space-y-4">
      {children}
      <dl className="space-y-1.5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">
            Subtotal
            {isRoundTrip && (
              <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                ×2 round trip
              </span>
            )}
          </dt>
          <dd className="tabular-nums">{formatMoney(subtotal ?? 0)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Discount</dt>
          <dd className="tabular-nums">
            {hasDiscount ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                −{formatMoney(discount)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between gap-4 rounded-lg bg-muted/60 px-3.5 py-3">
        <span className="text-sm font-semibold">Line total</span>
        <span className="text-xl font-bold tracking-tight tabular-nums">
          {formatMoney(lineTotal ?? 0)}
        </span>
      </div>
    </div>
  )
}

/** Placeholder used when nothing has been picked yet. */
export function PickHint({
  icon: Icon = PackageOpen,
  title,
  description,
}: {
  icon?: IconType
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card/50 px-4 py-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
