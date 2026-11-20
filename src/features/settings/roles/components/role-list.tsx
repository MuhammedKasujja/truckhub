import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { PencilIcon, Plus, ShieldHalf, UserCog } from "lucide-react"
import { createRolesQueryOptions } from "../query-options"
import { RoleEditForm } from "./role-edit-form"
import type { Role } from "../types"
import type { SystemUser } from "@/features/users/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import {
  allPermissionKeys,
  countEnabledKeys,
  modulesWithAccess,
} from "@/features/settings/permissions/permission-matrix"
import { usePermissionLabels } from "@/features/settings/permissions/use-permission-labels"
import { UserAvatar } from "@/features/users/components/user-avatar"
import { usersQueryOprions } from "@/features/users/query-options"
import { UserSearchParamsCache } from "@/features/users/schemas"
import { formatPlural } from "@/lib/format"

// There are only a handful of users, so one page covers everyone.
const allUsersSearch = UserSearchParamsCache.parse({ perPage: 100 })

export function RoleList() {
  const { data: roles } = useSuspenseQuery(createRolesQueryOptions())
  const { data: users } = useQuery(usersQueryOprions(allUsersSearch))
  const [editing, setEditing] = useState<Role>()
  const [isEditing, setIsEditing] = useState(false)

  const membersByRole = useMemo(() => {
    const map = new Map<string, SystemUser[]>()
    for (const user of users?.data ?? []) {
      for (const role of user.roles) {
        map.set(role.id, [...(map.get(role.id) ?? []), user])
      }
    }
    return map
  }, [users])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {formatPlural(roles.length, { singular: "role", plural: "roles" })}.
          Each user gets the combined permissions of their roles.
        </p>
        <Can permission="config:roles:create">
          <RoleEditForm />
        </Can>
      </div>

      {roles.length === 0 ? (
        <SectionEmpty
          icon={UserCog}
          title="No roles yet"
          description="Roles group permissions, like “Dispatcher” or “Accounts”, so you can give the same access to several people."
          className="bg-card py-14"
          action={
            <Can permission="config:roles:create">
              <RoleEditForm
                trigger={
                  <Button size="sm">
                    <Plus />
                    Create the first role
                  </Button>
                }
              />
            </Can>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              members={users ? (membersByRole.get(role.id) ?? []) : undefined}
              onEdit={() => {
                setEditing(role)
                setIsEditing(true)
              }}
            />
          ))}
        </div>
      )}

      <RoleEditForm
        key={editing?.id}
        initialData={editing}
        open={isEditing && !!editing}
        onOpenChange={setIsEditing}
      />
    </div>
  )
}

function RoleCard({
  role,
  members,
  onEdit,
}: {
  role: Role
  /** Undefined while users are loading or can't be read. */
  members?: SystemUser[]
  onEdit: () => void
}) {
  const { moduleLabel } = usePermissionLabels()
  const granted = new Set(role.permissions)
  const count = countEnabledKeys(granted)
  const modules = modulesWithAccess(granted)
  const shownModules = modules.slice(0, 5)

  return (
    <article className="flex flex-col rounded-xl border bg-card shadow-xs">
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserCog className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{role.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {role.description || "No description"}
          </p>
        </div>
        <Can permission="config:roles:create">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${role.name}`}
          >
            <PencilIcon />
          </Button>
        </Can>
      </div>

      <div className="space-y-3 px-4 pb-4">
        <div>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Permissions</span>
            <span className="font-medium tabular-nums">
              {count} of {allPermissionKeys.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(count / allPermissionKeys.length) * 100}%` }}
            />
          </div>
        </div>

        {modules.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No access yet. Choose permissions to get started.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {shownModules.map((m) => (
              <Badge key={m.module} variant="outline">
                {moduleLabel(m.module)}
              </Badge>
            ))}
            {modules.length > shownModules.length && (
              <Badge variant="outline" className="text-muted-foreground">
                +{modules.length - shownModules.length} more
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2.5">
        <Members members={members} />
        <Can permission="config:roles:assign_permissions">
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/settings/user-management/permissions"
              search={{ role: role.id }}
            >
              <ShieldHalf />
              Permissions
            </Link>
          </Button>
        </Can>
      </div>
    </article>
  )
}

function Members({ members }: { members?: SystemUser[] }) {
  if (!members) return <span />
  if (members.length === 0) {
    return <span className="text-xs text-muted-foreground">No members</span>
  }
  const shown = members.slice(0, 4)
  return (
    <span
      className="flex items-center gap-2"
      title={members.map((m) => m.name).join(", ")}
    >
      <span className="flex -space-x-2">
        {shown.map((m) => (
          <UserAvatar
            key={m.id}
            user={m}
            size="sm"
            className="ring-2 ring-card"
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatPlural(members.length, { singular: "member", plural: "members" })}
      </span>
    </span>
  )
}
