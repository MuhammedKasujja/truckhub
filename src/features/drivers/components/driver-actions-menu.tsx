import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { deleteDriverFn } from "../services"
import type { DriverSummary } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ActionIcon } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

/**
 * View / edit / delete "…" menu for one driver, gated by permission. Renders
 * nothing when the user can do none of them.
 */
export function DriverActionsMenu({ driver }: { driver: DriverSummary }) {
  const { hasPermission } = usePermissions()
  const canView = hasPermission("drivers:view")
  const canEdit = hasPermission("drivers:edit")
  const canDelete = hasPermission("drivers:delete")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const queryInvalidator = useQueryInvalidator()

  const remove = useMutation({
    mutationFn: () => deleteDriverFn({ data: { id: driver.id } }),
    onSuccess: ({ isSuccess, message, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't delete the driver")
        return
      }
      toast.success(message ?? "Driver deleted")
      setConfirmOpen(false)
      queryInvalidator.drivers.list.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  if (!canView && !canEdit && !canDelete) return null

  const params = { driverId: driver.id }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${driver.full_name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canView && (
            <DropdownMenuItem asChild>
              <Link to="/drivers/$driverId/view" params={params}>
                <ActionIcon action="view" />
                View
              </Link>
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link to="/drivers/$driverId/edit" params={params}>
                <ActionIcon action="edit" />
                Edit
              </Link>
            </DropdownMenuItem>
          )}
          {canDelete && (canView || canEdit) && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              <ActionIcon action="delete" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isLoading={remove.isPending}
        title={`Delete ${driver.full_name}?`}
        description="This removes the driver and can't be undone."
        confirmLabel="Delete"
        onConfirm={() => remove.mutate()}
      />
    </>
  )
}
