import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { deleteClientFn } from "../services"
import type { Client } from "../types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ActionIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
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
 * The "…" menu for one client: view, edit, start a quotation or invoice, and
 * delete. Each item is gated by permission; renders nothing when the user can
 * do none of them.
 */
export function ClientActionsMenu({ client }: { client: Client }) {
  const { hasPermission } = usePermissions()
  const canView = hasPermission("clients:view")
  const canEdit = hasPermission("clients:edit")
  const canQuote = hasPermission("quotations:create")
  const canInvoice = hasPermission("invoices:create")
  const canDelete = hasPermission("clients:delete")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const queryInvalidator = useQueryInvalidator()

  const remove = useMutation({
    mutationFn: () => deleteClientFn({ data: { id: client.id } }),
    onSuccess: ({ isSuccess, message, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't delete the client")
        return
      }
      toast.success(message ?? "Client deleted")
      setConfirmOpen(false)
      queryInvalidator.clients.list.invalidate()
      queryInvalidator.clients.profile(client.id).invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  const hasLinks = canView || canEdit
  const hasCreate = canQuote || canInvoice
  if (!hasLinks && !hasCreate && !canDelete) return null

  const params = { clientId: client.id }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${client.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {canView && (
            <DropdownMenuItem asChild>
              <Link to="/clients/$clientId/view" params={params}>
                <ActionIcon action="view" />
                View
              </Link>
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link to="/clients/$clientId/edit" params={params}>
                <ActionIcon action="edit" />
                Edit
              </Link>
            </DropdownMenuItem>
          )}
          {hasLinks && hasCreate && <DropdownMenuSeparator />}
          {canQuote && (
            <DropdownMenuItem asChild>
              <Link to="/quotations/new" search={{ clientId: client.id }}>
                <ActionIcon action="create" />
                New quotation
              </Link>
            </DropdownMenuItem>
          )}
          {canInvoice && (
            <DropdownMenuItem asChild>
              <Link to="/invoices/create" search={{ clientId: client.id }}>
                <ActionIcon action="create" />
                New invoice
              </Link>
            </DropdownMenuItem>
          )}
          {canDelete && (hasLinks || hasCreate) && <DropdownMenuSeparator />}
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
        title={`Delete ${client.name}?`}
        description="This removes the client and can't be undone."
        confirmLabel="Delete"
        onConfirm={() => remove.mutate()}
      />
    </>
  )
}
