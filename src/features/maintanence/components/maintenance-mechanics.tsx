import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useWatch } from "react-hook-form"
import { Crown, Loader2, Plus, UserRound, X } from "lucide-react"
import {
  useAssignMechanic,
  useSetLeadMechanic,
  useUnassignMechanic,
} from "../hooks/use-maintenance"
import { isOpenStatus } from "./maintenance-meta"
import type { Control, FieldValues, Path } from "react-hook-form"
import type { MaintenanceMechanic, MaintenanceRecord } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MultiSelectField, SelectField } from "@/components/ui/form-fields"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import {
  MECHANICS_SEARCH,
  staffListQueryOptions,
} from "@/features/hr/query-options"
import { cn } from "@/lib/utils"

/**
 * Active staff in the Mechanic position. Needs `staff:read`; without it the
 * list is empty and the mechanic controls offer no choices.
 */
export function useMechanics({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, isLoading } = useQuery({
    ...staffListQueryOptions(MECHANICS_SEARCH),
    enabled,
    retry: false,
  })
  const mechanics = data?.data ?? []
  return {
    mechanics,
    isLoading,
    options: mechanics.map((m) => ({
      value: m.id,
      label: m.number ? `${m.name} · ${m.number}` : m.name,
    })),
  }
}

/** The mechanics on a task, for the details sheet: add, remove and pick the lead. */
export function MaintenanceMechanicsSection({
  record,
}: {
  record: MaintenanceRecord
}) {
  const { hasPermission } = usePermissions()
  const canAssign =
    hasPermission("maintenance:assign_mechanics") && isOpenStatus(record.status)
  const { options, isLoading } = useMechanics({ enabled: canAssign })
  const assign = useAssignMechanic()
  const unassign = useUnassignMechanic()
  const setLead = useSetLeadMechanic()
  const [adding, setAdding] = useState<string>()
  const [busyId, setBusyId] = useState<string>()

  const assigned = new Set(record.mechanics.map((m) => m.staff_id))
  const available = options.filter((o) => !assigned.has(o.value))

  function add() {
    if (!adding) return
    assign.mutate(
      {
        data: {
          maintenanceId: record.id,
          staffId: adding,
          // The first mechanic on a task leads it
          isLead: record.mechanics.length === 0,
        },
      },
      { onSuccess: () => setAdding(undefined) }
    )
  }

  function run(
    action: typeof unassign | typeof setLead,
    mechanic: MaintenanceMechanic
  ) {
    setBusyId(mechanic.staff_id)
    action.mutate(
      { data: { maintenanceId: record.id, staffId: mechanic.staff_id } },
      { onSettled: () => setBusyId(undefined) }
    )
  }

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Mechanics
      </h3>

      {record.mechanics.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          No mechanics assigned yet.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {record.mechanics.map((mechanic) => (
            <li key={mechanic.staff_id} className="flex items-center gap-3 p-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
                  mechanic.is_lead && "bg-primary/10 text-primary"
                )}
              >
                <UserRound className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {mechanic.name}
                  </span>
                  {mechanic.is_lead && (
                    <Badge variant="secondary" className="text-primary">
                      Lead
                    </Badge>
                  )}
                </span>
                {(mechanic.number || mechanic.notes) && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {[mechanic.number, mechanic.notes]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </span>
              {canAssign && (
                <span className="flex shrink-0 items-center gap-1">
                  {busyId === mechanic.staff_id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      {!mechanic.is_lead && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Make ${mechanic.name} the lead`}
                          title="Make lead"
                          onClick={() => run(setLead, mechanic)}
                        >
                          <Crown />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${mechanic.name}`}
                        title="Remove from task"
                        onClick={() => run(unassign, mechanic)}
                      >
                        <X />
                      </Button>
                    </>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {canAssign && (
        <div className="flex gap-2">
          <Select value={adding ?? ""} onValueChange={setAdding}>
            <SelectTrigger aria-label="Mechanic to add" className="flex-1">
              <SelectValue
                placeholder={
                  isLoading
                    ? "Loading mechanics…"
                    : available.length === 0
                      ? "No other mechanics available"
                      : "Choose a mechanic"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {available.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={!adding || assign.isPending}
            onClick={add}
          >
            {assign.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Add
          </Button>
        </div>
      )}
    </section>
  )
}

/** Mechanics and the lead for a task being created. */
export function MechanicFields<T extends FieldValues>({
  control,
  idsName,
  leadName,
}: {
  control: Control<T>
  idsName: Path<T>
  leadName: Path<T>
}) {
  const { options, isLoading } = useMechanics()
  const selected = (useWatch({ control, name: idsName }) ?? []) as string[]
  const leadOptions = options.filter((o) => selected.includes(o.value))

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MultiSelectField
        label="Mechanics"
        name={idsName}
        control={control}
        options={options}
        placeholder={
          isLoading
            ? "Loading…"
            : options.length === 0
              ? "No mechanics in HR"
              : "Choose mechanics"
        }
        description="Staff in the Mechanic position."
      />
      {leadOptions.length > 1 && (
        <SelectField
          label="Lead mechanic"
          name={leadName}
          control={control}
          options={leadOptions}
          required={false}
          description="Responsible for the task."
        />
      )}
    </div>
  )
}
