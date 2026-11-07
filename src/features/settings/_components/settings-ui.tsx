import React from "react"
import { Check, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

/* -------------------------------------------------------------------------- */
/*                                Page layout                                 */
/* -------------------------------------------------------------------------- */

/** Width-capped column used by every settings page. */
export function SettingsPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full max-w-6xl flex-col gap-6 pr-4 pb-10",
        className
      )}
      {...props}
    />
  )
}

export function SettingsPageHeader({
  icon: Icon,
  title,
  description,
  actions,
  bordered = true,
}: {
  icon: IconType
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Turn off when something with its own border follows, like tabs. */
  bordered?: boolean
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        bordered && "border-b pb-5"
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

/** A titled card that groups related settings. */
export function SettingsSection({
  icon: Icon,
  title,
  description,
  action,
  footer,
  children,
  className,
  contentClassName,
}: {
  icon?: IconType
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-sm leading-8 font-semibold">{title}</h2>
            {description && (
              <p className="-mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("flex-1 p-5", contentClassName)}>{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3">
          {footer}
        </div>
      )}
    </section>
  )
}

/** Label / value pair with an icon, used in read-only detail grids. */
export function DetailItem({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: IconType
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium break-words">{children}</div>
      </div>
    </div>
  )
}

export function MissingValue({ children = "Not set" }: { children?: string }) {
  return <span className="font-normal text-muted-foreground/70">{children}</span>
}

/** Compact empty state for use inside a section. */
export function SectionEmpty({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function SettingsPageSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <SettingsPage aria-busy="true">
      <div className="flex items-start gap-3.5 border-b pb-5">
        <div className="size-11 animate-pulse rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-72 animate-pulse rounded bg-muted" />
        </div>
      </div>
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/60" />
      ))}
    </SettingsPage>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Form dialogs                                */
/* -------------------------------------------------------------------------- */

const dialogSizes = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
} as const

/**
 * Shared shell for the settings form dialogs: icon header, scrolling body and
 * a Cancel / submit footer.
 */
export function SettingsFormDialog({
  open,
  onOpenChange,
  trigger,
  icon: Icon,
  eyebrow,
  title,
  description,
  onSubmit,
  isSubmitting,
  submitText = "Save changes",
  submitDisabled,
  footerNote,
  size = "md",
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  icon: IconType
  eyebrow?: string
  title: string
  description?: string
  onSubmit: React.FormEventHandler<HTMLFormElement>
  isSubmitting?: boolean
  submitText?: string
  submitDisabled?: boolean
  footerNote?: React.ReactNode
  size?: keyof typeof dialogSizes
  children: React.ReactNode
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting && !next) return
        onOpenChange(next)
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0",
          dialogSizes[size]
        )}
      >
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            // Keep the submit from reaching any form this dialog sits inside.
            e.stopPropagation()
            onSubmit(e)
          }}
        >
          <DialogHeader className="shrink-0 flex-row items-center gap-3.5 border-b px-5 py-4 pr-12 text-left">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              {eyebrow && (
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {eyebrow}
                </p>
              )}
              <DialogTitle className="text-base font-bold tracking-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {children}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 items-center px-5 py-3">
            <div className="mr-auto hidden text-xs text-muted-foreground sm:block">
              {footerNote}
            </div>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="shadow-sm"
              disabled={isSubmitting || submitDisabled}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Check />
              )}
              {isSubmitting ? "Saving…" : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** A labelled group of fields inside a form dialog. */
export function FormGroup({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <fieldset className={cn("space-y-3.5", className)}>
      <div>
        <legend className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </legend>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </fieldset>
  )
}

/** Selectable tile for small single-choice option sets. */
export function OptionTile({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  className,
}: {
  selected: boolean
  onSelect: () => void
  icon?: IconType
  title: string
  description?: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-start gap-2.5 rounded-lg border bg-background p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected && "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/5"
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
            selected && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {selected && (
        <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      )}
    </button>
  )
}
