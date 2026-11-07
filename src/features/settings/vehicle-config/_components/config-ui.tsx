import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { MoreHorizontal, PencilIcon, SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>

/** Search box + filters on the left, primary action on the right. */
export function ConfigToolbar({
  search,
  onSearchChange,
  placeholder,
  filters,
  action,
}: {
  search: string
  onSearchChange: (value: string) => void
  placeholder: string
  filters?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <InputGroup className="lg:max-w-72">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {search && (
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </InputGroupAddon>
        )}
      </InputGroup>
      {filters && <div className="flex flex-wrap items-center gap-1.5">{filters}</div>}
      {action && <div className="lg:ml-auto">{action}</div>}
    </div>
  )
}

/** Filter chip with a count; active state uses the primary tint. */
export function FilterChip({
  label,
  icon: Icon,
  count,
  active,
  onClick,
}: {
  label: string
  icon?: IconType
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active &&
          "border-primary bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
      )}
    >
      {Icon && <Icon className="size-4" />}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-md bg-muted px-1.5 text-xs text-muted-foreground tabular-nums",
            active && "bg-primary/15 text-primary"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/** Image with an icon fallback when there is no URL or it fails to load. */
export function MediaImage({
  src,
  alt,
  icon: Icon,
  fit = "contain",
  className,
}: {
  src?: string | null
  alt: string
  icon: IconType
  fit?: "contain" | "cover"
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn("relative overflow-hidden bg-muted/40", className)}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn(
            "size-full transition-transform duration-300 group-hover:scale-[1.03]",
            fit === "contain" ? "object-contain p-4" : "object-cover"
          )}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground/40">
          <Icon className="size-12" strokeWidth={1.25} />
        </div>
      )}
    </div>
  )
}

/** Edit / delete "…" menu for a config card, gated by permission. */
export function ConfigCardMenu({
  label,
  onEdit,
  onDelete,
}: {
  label: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <Can permission="config:vehicle_config:edit">
          <DropdownMenuItem onSelect={onEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
        </Can>
        <Can permission="config:vehicle_config:delete">
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <ActionIcon action="delete" />
            Delete
          </DropdownMenuItem>
        </Can>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type DeleteResult = {
  isSuccess: boolean
  message?: string | null
  error?: { message: string } | null
}

/** Confirm-then-delete dialog for a single config record. */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onDelete,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onDelete: () => Promise<DeleteResult>
  onDeleted: () => void
}) {
  const remove = useMutation({
    mutationFn: onDelete,
    onSuccess: ({ isSuccess, message, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't delete it")
        return
      }
      toast.success(message ?? "Deleted")
      onDeleted()
      onOpenChange(false)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={remove.isPending}
      title={title}
      description={description}
      confirmLabel="Delete"
      onConfirm={() => remove.mutate()}
    />
  )
}

/** Card-grid placeholder for pending routes. */
export function ConfigGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="flex justify-between gap-3">
        <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  )
}
