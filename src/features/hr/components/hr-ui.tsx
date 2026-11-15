import { Controller } from "react-hook-form"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  LEAVE_STATUS_LABELS,
  RUN_STATUS_LABELS,
  STAFF_STATUS_LABELS,
} from "../labels"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import type {
  LeaveRequestStatus,
  PayrollRunStatus,
  StaffStatus,
} from "../types"
import type { Pagination } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

/** Earliest date the HR date pickers go back to (births, old hire dates). */
export const EARLIEST_DATE = new Date(1940, 0, 1)

const tones = {
  green:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:text-amber-400",
  red: "bg-destructive/10 text-destructive ring-destructive/20",
  blue: "bg-sky-500/10 text-sky-700 ring-sky-600/20 dark:text-sky-400",
  grey: "bg-muted text-muted-foreground ring-border",
} as const

type Tone = keyof typeof tones

export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

const STAFF_TONES: Record<StaffStatus, Tone> = {
  active: "green",
  suspended: "amber",
  terminated: "grey",
}

const LEAVE_TONES: Record<LeaveRequestStatus, Tone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  cancelled: "grey",
}

const RUN_TONES: Record<PayrollRunStatus, Tone> = {
  draft: "amber",
  approved: "blue",
  paid: "green",
  cancelled: "grey",
}

export function StaffStatusPill({ status }: { status: StaffStatus }) {
  return (
    <StatusPill tone={STAFF_TONES[status]}>
      {STAFF_STATUS_LABELS[status]}
    </StatusPill>
  )
}

export function LeaveStatusPill({ status }: { status: LeaveRequestStatus }) {
  return (
    <StatusPill tone={LEAVE_TONES[status]}>
      {LEAVE_STATUS_LABELS[status]}
    </StatusPill>
  )
}

export function RunStatusPill({ status }: { status: PayrollRunStatus }) {
  return (
    <StatusPill tone={RUN_TONES[status]}>{RUN_STATUS_LABELS[status]}</StatusPill>
  )
}

const ALL = "__all__"

/** A dropdown filter whose first choice clears it. */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  label,
  className,
}: {
  value: T | undefined
  onChange: (value: T | undefined) => void
  options: readonly { value: T; label: string }[]
  allLabel: string
  /** Read by screen readers; the visible text is the current choice. */
  label: string
  className?: string
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : (next as T))}
    >
      <SelectTrigger aria-label={label} className={cn("w-44", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Pager({
  pagination,
  onPageChange,
}: {
  pagination: Pagination | undefined
  onPageChange: (page: number) => void
}) {
  if (!pagination || pagination.totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

/** Bordered wrapper that lets a wide table scroll sideways on small screens. */
export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
      {children}
    </div>
  )
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
      <div className="overflow-hidden rounded-xl border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse border-b bg-muted/40 last:border-b-0" />
        ))}
      </div>
    </div>
  )
}

export function LoadError({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {message || "Couldn't load this. Refresh the page to try again."}
    </div>
  )
}

const NONE = "__none__"

/**
 * A select for an optional field. Unlike the shared SelectField, its first
 * choice clears the value, so a department or head can be unset again.
 */
export function OptionalSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  noneLabel,
  description,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  options: readonly { value: string; label: string }[]
  /** Text of the choice that clears the field, e.g. "No department". */
  noneLabel: string
  description?: string
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            value={field.value || NONE}
            onValueChange={(next) => field.onChange(next === NONE ? null : next)}
          >
            <SelectTrigger
              id={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{noneLabel}</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
