import { useEffect, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MailIcon,
  PhoneIcon,
  Plus,
  SearchIcon,
  ShieldCheck,
  Users,
  X,
} from "lucide-react"
import { usersQueryOprions } from "../query-options"
import { UserAvatar, formatRelativeTime } from "./user-avatar"
import { DeleteUserDialog, UserActionsMenu } from "./user-actions"
import { UserAssignRolesDialog } from "./user-assign-roles-dialog"
import type { SystemUser } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { useDebounce } from "@/hooks/use-debounce"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { formatPlural } from "@/lib/format"

type Dialog = { kind: "roles" | "delete"; user: SystemUser }

export function UserList() {
  const search = useSearch({ from: "/_admin/settings/user-management/users/" })
  const navigate = useNavigate({ from: "/settings/user-management/users/" })
  const {
    data: { data: users, pagination },
    error,
  } = useSuspenseQuery(usersQueryOprions(search))
  useFetchEror(error)

  // The query lives in the URL; type freely, then update it once typing stops.
  const [query, setQuery] = useState(search.search)
  const debouncedQuery = useDebounce(query, 350)
  useEffect(() => {
    if (debouncedQuery !== search.search) {
      navigate({
        search: (prev) => ({ ...prev, search: debouncedQuery, page: 1 }),
        replace: true,
      })
    }
  }, [debouncedQuery, search.search, navigate])

  const [dialog, setDialog] = useState<Dialog>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const openDialog = (kind: Dialog["kind"], user: SystemUser) => {
    setDialog({ kind, user })
    setDialogOpen(true)
  }

  const admins = users.filter((u) => u.is_admin).length
  const neverSignedIn = users.filter((u) => !u.last_login).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or phone"
            aria-label="Search users"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>
        <Can permission="users:create">
          <Button asChild>
            <Link to="/settings/user-management/users/new">
              <Plus />
              Add user
            </Link>
          </Button>
        </Can>
      </div>

      {users.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatPlural(pagination.total, { singular: "user", plural: "users" })}
          {admins > 0 &&
            ` · ${formatPlural(admins, { singular: "administrator", plural: "administrators" })}`}
          {neverSignedIn > 0 && ` · ${neverSignedIn} never signed in`}
        </p>
      )}

      {users.length === 0 ? (
        <SectionEmpty
          icon={Users}
          title={search.search ? "No users match your search" : "No users yet"}
          description={
            search.search
              ? "Try a different name, email or phone number."
              : "Add the people who need to sign in to the system."
          }
          className="bg-card py-14"
          action={
            search.search ? (
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onAssignRoles={() => openDialog("roles", user)}
              onDelete={() => openDialog("delete", user)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={search.page <= 1}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: prev.page - 1 }) })
              }
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={search.page >= pagination.totalPages}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
              }
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <UserAssignRolesDialog
        user={dialog?.user}
        open={dialogOpen && dialog?.kind === "roles"}
        onOpenChange={setDialogOpen}
      />
      <DeleteUserDialog
        user={dialog?.user}
        open={dialogOpen && dialog?.kind === "delete"}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

function UserCard({
  user,
  onAssignRoles,
  onDelete,
}: {
  user: SystemUser
  onAssignRoles: () => void
  onDelete: () => void
}) {
  const lastSeen = formatRelativeTime(user.last_login)

  return (
    <article className="group relative flex flex-col rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <Link
            to="/settings/user-management/users/$userId/view"
            params={{ userId: user.id }}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {user.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {user.username ? `@${user.username}` : (user.number ?? "")}
          </p>
        </div>
        <UserActionsMenu
          user={user}
          onAssignRoles={onAssignRoles}
          onDelete={onDelete}
        />
      </div>

      <dl className="space-y-1.5 px-4 pb-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MailIcon className="size-3.5 shrink-0" />
          <dt className="sr-only">Email</dt>
          <dd className="truncate text-foreground/90">{user.email}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <PhoneIcon className="size-3.5 shrink-0" />
          <dt className="sr-only">Phone</dt>
          <dd className="truncate text-foreground/90">
            {user.phone || <span className="text-muted-foreground/70">No phone</span>}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t px-4 py-3">
        {user.is_admin ? (
          <Badge>
            <ShieldCheck />
            Administrator
          </Badge>
        ) : user.roles.length === 0 ? (
          <button type="button" onClick={onAssignRoles}>
            <Badge variant="outline" className="border-dashed text-muted-foreground hover:bg-muted">
              <Plus />
              No roles, assign
            </Badge>
          </button>
        ) : (
          user.roles.map((role) => (
            <Badge key={role.id} variant="secondary" title={role.description}>
              {role.name}
            </Badge>
          ))
        )}
        <span
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"
          title={user.last_login ?? undefined}
        >
          <Clock className="size-3" />
          {lastSeen ?? "Never signed in"}
        </span>
      </div>
    </article>
  )
}

export function UserListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="flex justify-between gap-3">
        <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  )
}
