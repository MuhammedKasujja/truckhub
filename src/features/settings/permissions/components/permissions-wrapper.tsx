import { useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Check,
  Loader2,
  Minus,
  RotateCcw,
  Save,
  SearchIcon,
  ShieldHalf,
  UserCog,
  X,
} from "lucide-react"
import {
  allPermissionKeys,
  changedKeys,
  countEnabledKeys,
  disableKeys,
  enableKeys,
  isKeyOn,
  keysIncluding,
  modulesWithAccess,
  permissionModules,
} from "../permission-matrix"
import { usePermissionLabels } from "../use-permission-labels"
import type { PermissionKey, PermissionModule } from "../permission-matrix"
import type { Role } from "@/features/settings/roles/types"
import { assignPermissionsToRoleFn } from "@/features/settings/permissions/services"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { cn } from "@/lib/utils"

const TOTAL_KEYS = allPermissionKeys.length

export function PermissionsWrapper() {
  const { data: roles } = useSuspenseQuery(createRolesQueryOptions())
  const search = useSearch({
    from: "/_admin/settings/user-management/permissions/",
  })
  const navigate = useNavigate({ from: "/settings/user-management/permissions/" })
  const queryInvalidator = useQueryInvalidator()
  const { moduleLabel, keyLabel } = usePermissionLabels()

  const role = roles.find((r) => r.id === search.role) ?? roles.at(0)
  const saved = useMemo(() => new Set(role?.permissions ?? []), [role])

  // Unsaved edits belong to one role; switching roles starts from its saved set.
  const [draft, setDraft] = useState<{ roleId: string; set: Set<string> }>()
  const selected = draft && draft.roleId === role?.id ? draft.set : saved
  const changes = useMemo(() => changedKeys(selected, saved), [selected, saved])
  const changedSet = useMemo(() => new Set(changes.map((k) => k.key)), [changes])

  const [query, setQuery] = useState("")
  const [pendingRoleId, setPendingRoleId] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)

  function update(next: Set<string>) {
    if (role) setDraft({ roleId: role.id, set: next })
  }

  function selectRole(roleId: string) {
    if (roleId === role?.id) return
    if (changes.length > 0) {
      setPendingRoleId(roleId)
      return
    }
    navigate({ search: { role: roleId }, replace: true })
  }

  async function save() {
    if (!role) return
    setIsSaving(true)
    const { error, isSuccess } = await assignPermissionsToRoleFn({
      data: { roleId: role.id, permissions: [...selected] },
    })
    setIsSaving(false)
    if (!isSuccess) {
      toast.error(error?.message ?? "Couldn't save permissions")
      return
    }
    toast.success(`Permissions saved for ${role.name}`)
    queryInvalidator.settings.roles.list()
  }

  const visibleModules = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return permissionModules
    return permissionModules
      .map((m) =>
        moduleLabel(m.module).toLowerCase().includes(q)
          ? m
          : {
              ...m,
              keys: m.keys.filter((k) =>
                keyLabel(k.key).toLowerCase().includes(q)
              ),
            }
      )
      .filter((m) => m.keys.length > 0)
  }, [query, moduleLabel, keyLabel])

  if (!role) {
    return (
      <SectionEmpty
        icon={UserCog}
        title="No roles yet"
        description="Create a role on the Roles tab, then choose what it can do here."
        className="bg-card py-14"
      />
    )
  }

  const enabledCount = countEnabledKeys(selected)
  const areaCount = modulesWithAccess(selected).length

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Roles */}
      <aside className="lg:sticky lg:top-4">
        <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Roles
        </p>
        <div
          role="radiogroup"
          aria-label="Role"
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {roles.map((r) => (
            <RoleButton
              key={r.id}
              role={r}
              selected={r.id === role.id}
              unsaved={r.id === role.id && changes.length > 0}
              onSelect={() => selectRole(r.id)}
            />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        {/* Role summary + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Editing role
            </p>
            <h2 className="truncate text-lg font-bold tracking-tight">
              {role.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {enabledCount} of {TOTAL_KEYS} permissions · {areaCount} of{" "}
              {permissionModules.length} areas
            </p>
          </div>
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a permission"
              aria-label="Find a permission"
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
        </div>

        {visibleModules.length === 0 ? (
          <SectionEmpty
            icon={SearchIcon}
            title="No permissions match"
            description="Try another word, like “invoice” or “delete”."
            className="bg-card"
          />
        ) : (
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {visibleModules.map((m) => (
              <ModuleCard
                key={m.module}
                module={m}
                fullModule={permissionModules.find((pm) => pm.module === m.module)!}
                label={moduleLabel(m.module)}
                keyLabel={keyLabel}
                selected={selected}
                changed={changedSet}
                onChange={update}
              />
            ))}
          </div>
        )}

        {/* Save bar */}
        <div
          className={cn(
            "sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition-all",
            changes.length > 0
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          )}
          aria-hidden={changes.length === 0}
        >
          <p className="text-sm">
            <span className="font-medium">
              {changes.length} unsaved {changes.length === 1 ? "change" : "changes"}
            </span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}
              · applies to everyone with the {role.name} role
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={() => setDraft(undefined)}
            >
              <RotateCcw />
              Discard
            </Button>
            <Button size="sm" disabled={isSaving} onClick={save}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              Save permissions
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingRoleId}
        onOpenChange={(open) => !open && setPendingRoleId(undefined)}
        title="Discard unsaved changes?"
        description={`Your changes to ${role.name} haven't been saved.`}
        confirmLabel="Discard changes"
        onConfirm={() => {
          setDraft(undefined)
          navigate({ search: { role: pendingRoleId }, replace: true })
          setPendingRoleId(undefined)
        }}
      />
    </div>
  )
}

function RoleButton({
  role,
  selected,
  unsaved,
  onSelect,
}: {
  role: Role
  selected: boolean
  unsaved: boolean
  onSelect: () => void
}) {
  const count = countEnabledKeys(new Set(role.permissions))
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "w-56 shrink-0 rounded-lg border bg-card p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:w-full",
        selected && "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/5"
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{role.name}</span>
        {unsaved && (
          <span className="size-2 shrink-0 rounded-full bg-primary" title="Unsaved changes" />
        )}
      </span>
      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full bg-muted-foreground/40", selected && "bg-primary")}
          style={{ width: `${(count / TOTAL_KEYS) * 100}%` }}
        />
      </span>
      <span className="mt-1 block text-xs text-muted-foreground tabular-nums">
        {count} of {TOTAL_KEYS} permissions
      </span>
    </button>
  )
}

function ModuleCard({
  module,
  fullModule,
  label,
  keyLabel,
  selected,
  changed,
  onChange,
}: {
  /** The keys to show (may be narrowed by search). */
  module: PermissionModule
  /** Every key in the module, for the counts and select-all. */
  fullModule: PermissionModule
  label: string
  keyLabel: (key: string) => string
  selected: Set<string>
  changed: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const onCount = fullModule.keys.filter((k) => isKeyOn(selected, k)).length
  const total = fullModule.keys.length
  const state = onCount === 0 ? "none" : onCount === total ? "all" : "some"

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
              onCount > 0 && "bg-primary/10 text-primary"
            )}
          >
            <ShieldHalf className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{label}</h3>
            <p className="text-xs text-muted-foreground tabular-nums">
              {onCount} of {total} on
            </p>
          </div>
        </div>
        <button
          type="button"
          role="checkbox"
          aria-checked={state === "all" ? true : state === "some" ? "mixed" : false}
          onClick={() =>
            onChange(
              state === "all"
                ? disableKeys(selected, fullModule.keys)
                : enableKeys(selected, fullModule.keys)
            )
          }
          className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span
            className={cn(
              "flex size-4 items-center justify-center rounded-[4px] border border-input bg-background",
              state !== "none" && "border-primary bg-primary text-primary-foreground"
            )}
          >
            {state === "all" && <Check className="size-3" />}
            {state === "some" && <Minus className="size-3" />}
          </span>
          {state === "all" ? "Turn all off" : "Turn all on"}
        </button>
      </div>

      <ul className="divide-y">
        {module.keys.map((key) => (
          <PermissionRow
            key={key.key}
            permission={key}
            label={keyLabel(key.key)}
            keyLabel={keyLabel}
            selected={selected}
            changed={changed.has(key.key)}
            onChange={onChange}
          />
        ))}
      </ul>
    </section>
  )
}

function PermissionRow({
  permission,
  label,
  keyLabel,
  selected,
  changed,
  onChange,
}: {
  permission: PermissionKey
  label: string
  keyLabel: (key: string) => string
  selected: Set<string>
  changed: boolean
  onChange: (next: Set<string>) => void
}) {
  const on = isKeyOn(selected, permission)
  const includedBy = on ? keysIncluding(selected, permission) : []
  const locked = includedBy.length > 0
  const id = `perm-${permission.key}`

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2.5",
        changed && "bg-primary/5"
      )}
    >
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="flex items-center gap-2 text-sm">
          {label}
          {changed && (
            <span className="rounded bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary uppercase">
              Changed
            </span>
          )}
        </span>
        {locked && (
          <span className="block text-xs text-muted-foreground">
            Included with {includedBy.map((k) => keyLabel(k.key)).join(", ")}
          </span>
        )}
      </label>
      <Switch
        id={id}
        checked={on}
        disabled={locked}
        onCheckedChange={(checked) =>
          onChange(
            checked
              ? enableKeys(selected, [permission])
              : disableKeys(selected, [permission])
          )
        }
      />
    </li>
  )
}
