import { Link } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { MoreHorizontal, UserCog } from "lucide-react"
import { deleteUserFn } from "../services"
import type { SystemUser } from "../types"
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
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onDeleted,
}: {
  user?: SystemUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const queryInvalidator = useQueryInvalidator()
  const remove = useMutation({
    mutationFn: (id: string) => deleteUserFn({ data: { id } }),
    onSuccess: ({ isSuccess, message, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't delete the user")
        return
      }
      toast.success(message ?? "User deleted")
      queryInvalidator.users.list.invalidate()
      onOpenChange(false)
      onDeleted?.()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={remove.isPending}
      title={user ? `Delete ${user.name}?` : "Delete user?"}
      description="They will no longer be able to sign in. This can't be undone."
      confirmLabel="Delete user"
      onConfirm={() => user && remove.mutate(user.id)}
    />
  )
}

/** "…" menu for a user: view, edit, roles and delete, by permission. */
export function UserActionsMenu({
  user,
  onAssignRoles,
  onDelete,
  showView = true,
}: {
  user: SystemUser
  onAssignRoles: () => void
  onDelete: () => void
  showView?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${user.name}`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {showView && (
          <Can permission="users:view">
            <DropdownMenuItem asChild>
              <Link
                to="/settings/user-management/users/$userId/view"
                params={{ userId: user.id }}
              >
                <ActionIcon action="view" />
                View details
              </Link>
            </DropdownMenuItem>
          </Can>
        )}
        <Can permission="users:edit">
          <DropdownMenuItem asChild>
            <Link
              to="/settings/user-management/users/$userId/edit"
              params={{ userId: user.id }}
            >
              <ActionIcon action="edit" />
              Edit details
            </Link>
          </DropdownMenuItem>
        </Can>
        {/* Administrators have every permission, so roles don't apply. */}
        {!user.is_admin && (
          <>
            <DropdownMenuItem onSelect={onAssignRoles}>
              <UserCog />
              Change roles
            </DropdownMenuItem>
            <Can permission="users:delete">
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <ActionIcon action="delete" />
                Delete user
              </DropdownMenuItem>
            </Can>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
