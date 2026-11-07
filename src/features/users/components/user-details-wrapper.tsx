import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  Clock,
  Hash,
  IdCard,
  KeyRound,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheck,
  UserCog,
  UserIcon,
} from "lucide-react"
import { UserAvatar, formatRelativeTime } from "./user-avatar"
import { DeleteUserDialog, UserActionsMenu } from "./user-actions"
import { UserAssignRolesDialog } from "./user-assign-roles-dialog"
import type { SystemUser } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import {
  DetailItem,
  MissingValue,
  SectionEmpty,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import {
  countEnabledKeys,
  modulesWithAccess,
} from "@/features/settings/permissions/permission-matrix"
import { usePermissionLabels } from "@/features/settings/permissions/use-permission-labels"
import { formatDateTime } from "@/lib/format"

type UserDetailsWrapperProps = {
  user: SystemUser | undefined
}

export function UserDetailsWrapper({ user }: UserDetailsWrapperProps) {
  const navigate = useNavigate()
  const [dialog, setDialog] = useState<"roles" | "delete">()

  if (!user) {
    return (
      <SectionEmpty
        icon={UserIcon}
        title="User not found"
        description="They may have been deleted."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings/user-management/users">Back to users</Link>
          </Button>
        }
      />
    )
  }

  const lastSeen = formatRelativeTime(user.last_login)

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/settings/user-management/users"
        className="-mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All users
      </Link>

      {/* Identity */}
      <section className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-xs">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div>
            <h2 className="truncate text-xl font-bold tracking-tight">
              {user.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {user.is_admin && (
              <Badge>
                <ShieldCheck />
                Administrator
              </Badge>
            )}
            {user.roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {lastSeen ? `Signed in ${lastSeen}` : "Never signed in"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can permission="users:edit">
            <Button variant="outline" asChild>
              <Link
                to="/settings/user-management/users/$userId/edit"
                params={{ userId: user.id }}
              >
                <PencilIcon />
                Edit
              </Link>
            </Button>
          </Can>
          <UserActionsMenu
            user={user}
            showView={false}
            onAssignRoles={() => setDialog("roles")}
            onDelete={() => setDialog("delete")}
          />
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-6">
          <SettingsSection icon={IdCard} title="Contact">
            <div className="grid gap-5">
              <DetailItem icon={MailIcon} label="Email">
                <a href={`mailto:${user.email}`} className="hover:underline">
                  {user.email}
                </a>
              </DetailItem>
              <DetailItem icon={PhoneIcon} label="Phone">
                {user.phone ? (
                  <a href={`tel:${user.phone}`} className="hover:underline">
                    {user.phone}
                  </a>
                ) : (
                  <MissingValue />
                )}
              </DetailItem>
            </div>
          </SettingsSection>

          <SettingsSection icon={KeyRound} title="Account">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem icon={AtSign} label="Username">
                {user.username || <MissingValue />}
              </DetailItem>
              <DetailItem icon={Hash} label="User no.">
                {user.number ? (
                  <span className="font-mono text-xs">{user.number}</span>
                ) : (
                  <MissingValue />
                )}
              </DetailItem>
              <DetailItem icon={CalendarDays} label="Added">
                {formatDateTime(user.created_at)}
              </DetailItem>
              <DetailItem icon={Clock} label="Last sign-in">
                {user.last_login ? (
                  formatDateTime(user.last_login)
                ) : (
                  <MissingValue>Never</MissingValue>
                )}
              </DetailItem>
            </div>
          </SettingsSection>
        </div>

        <UserAccessSection
          user={user}
          onChangeRoles={() => setDialog("roles")}
        />
      </div>

      <UserAssignRolesDialog
        user={user}
        open={dialog === "roles"}
        onOpenChange={(open) => !open && setDialog(undefined)}
      />
      <DeleteUserDialog
        user={user}
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        onDeleted={() => navigate({ to: "/settings/user-management/users" })}
      />
    </div>
  )
}

/** The user's roles and, combined, the areas of the system they can use. */
function UserAccessSection({
  user,
  onChangeRoles,
}: {
  user: SystemUser
  onChangeRoles: () => void
}) {
  const { moduleLabel } = usePermissionLabels()
  // The user payload has role names only; permissions come from the roles list.
  const { data: roles = [] } = useQuery(createRolesQueryOptions())
  const userRoles = roles.filter((r) => user.roles.some((ur) => ur.id === r.id))
  const granted = new Set(userRoles.flatMap((r) => r.permissions))
  const modules = modulesWithAccess(granted)

  if (user.is_admin) {
    return (
      <SettingsSection icon={ShieldCheck} title="Access">
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">Full access</p>
            <p className="text-xs text-muted-foreground">
              Administrators can use every part of the system, whatever their
              roles.
            </p>
          </div>
        </div>
      </SettingsSection>
    )
  }

  return (
    <SettingsSection
      icon={UserCog}
      title="Roles & access"
      description="What this user can do comes from their roles"
      action={
        <Button variant="outline" size="sm" onClick={onChangeRoles}>
          <UserCog />
          Change roles
        </Button>
      }
    >
      {user.roles.length === 0 ? (
        <SectionEmpty
          icon={UserCog}
          title="No roles"
          description="This user can sign in but can't open anything until they have a role."
          action={
            <Button size="sm" onClick={onChangeRoles}>
              Assign a role
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          <ul className="space-y-2">
            {user.roles.map((role) => {
              const full = userRoles.find((r) => r.id === role.id)
              return (
                <li
                  key={role.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{role.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role.description || "No description"}
                    </p>
                  </div>
                  {full && (
                    <Can permission="config:roles:assign_permissions">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-muted-foreground"
                        asChild
                      >
                        <Link
                          to="/settings/user-management/permissions"
                          search={{ role: role.id }}
                        >
                          {countEnabledKeys(new Set(full.permissions))} permissions
                        </Link>
                      </Button>
                    </Can>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Can use
            </p>
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                These roles don't grant access to any area yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {modules.map((m) => (
                  <Badge key={m.module} variant="outline" className="h-6 px-2.5">
                    {moduleLabel(m.module)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
