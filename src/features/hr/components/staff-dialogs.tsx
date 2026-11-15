import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import {
  Banknote,
  CalendarClock,
  Check,
  KeyRound,
  ListChecks,
  UserX,
} from "lucide-react"
import { payComponentsQueryOptions } from "../query-options"
import {
  CompensationSetSchema,
  LeaveBalanceAdjustSchema,
  StaffTerminateSchema,
  SystemAccessGrantSchema,
} from "../schemas"
import {
  adjustLeaveBalanceFn,
  grantSystemAccessFn,
  setStaffCompensationFn,
  setStaffComponentsFn,
  terminateStaffFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import { COMPONENT_KIND_LABELS, formatComponentValue } from "../labels"
import type z from "zod"
import type { LeaveBalance, Staff, StaffCompensation } from "../types"
import { Input } from "@/components/ui/input"
import {
  DatePickerField,
  MoneyField,
  NumberField,
  PasswordField,
  TextField,
  TextareaField,
} from "@/components/ui/form-fields"
import {
  FormGroup,
  SectionEmpty,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { cn } from "@/lib/utils"

type DialogProps = {
  staff: Staff
  open: boolean
  onOpenChange: (open: boolean) => void
}

const today = () => new Date().toLocaleDateString("en-CA")

/* ------------------------------- Terminate -------------------------------- */

export function TerminateStaffDialog({ staff, open, onOpenChange }: DialogProps) {
  type Values = z.infer<typeof StaffTerminateSchema>
  const form = useForm<Values>({
    resolver: zodResolver(StaffTerminateSchema),
    defaultValues: { id: staff.id, termination_date: today(), reason: "" },
  })
  useEffect(() => {
    if (open) form.reset({ id: staff.id, termination_date: today(), reason: "" })
  }, [open])

  const terminate = useHrAction(
    (data: Values) => terminateStaffFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={UserX}
      eyebrow="End employment"
      title={`Terminate ${staff.name}`}
      description={
        staff.has_system_access
          ? "Their login is switched off straight away. They are still paid for a month they worked part of."
          : "They are still paid for a month they worked part of."
      }
      size="sm"
      submitText="Terminate"
      isSubmitting={terminate.isPending}
      onSubmit={form.handleSubmit((values) => terminate.run(values))}
    >
      <DatePickerField
        label="Last day of employment"
        name="termination_date"
        control={form.control}
        startDate={new Date(staff.hire_date)}
      />
      <TextareaField
        label="Reason"
        name="reason"
        control={form.control}
        required={false}
        placeholder="e.g. Resigned"
      />
    </SettingsFormDialog>
  )
}

/* ----------------------------- System access ------------------------------ */

export function GrantAccessDialog({ staff, open, onOpenChange }: DialogProps) {
  type Values = z.infer<typeof SystemAccessGrantSchema>
  // A staff member whose access was revoked still has their old login.
  const reactivating = !!staff.user_id
  const { data: roles = [], isLoading } = useQuery({
    ...createRolesQueryOptions(),
    enabled: open,
  })

  const emptyValues: Values = {
    id: staff.id,
    password: "",
    username: "",
    role_ids: [],
  }
  const form = useForm<Values>({
    resolver: zodResolver(SystemAccessGrantSchema),
    defaultValues: emptyValues,
  })
  useEffect(() => {
    if (open) form.reset(emptyValues)
  }, [open])

  const grant = useHrAction(
    (data: Values) => grantSystemAccessFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  const selected = form.watch("role_ids")
  const toggleRole = (id: string) =>
    form.setValue(
      "role_ids",
      selected.includes(id) ? selected.filter((r) => r !== id) : [...selected, id]
    )

  function onSubmit(values: Values) {
    if (!reactivating && !values.password) {
      form.setError("password", { message: "Set a password for their first sign-in" })
      return
    }
    grant.run(values)
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={KeyRound}
      eyebrow="System access"
      title={reactivating ? `Switch ${staff.name}'s login back on` : `Give ${staff.name} a login`}
      description={
        reactivating
          ? "They sign in with the same email as before."
          : `They will sign in with ${staff.email ?? "their email"}. They can then see their own record, leave and payslips.`
      }
      submitText={reactivating ? "Switch on" : "Create login"}
      submitDisabled={!reactivating && !staff.email}
      isSubmitting={grant.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {!reactivating && !staff.email && (
        <p role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          Add an email address to this staff member first; it is what they sign
          in with.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          label={reactivating ? "New password" : "Password"}
          name="password"
          control={form.control}
          required={!reactivating}
        />
        {!reactivating && (
          <TextField
            label="Username"
            name="username"
            control={form.control}
            required={false}
          />
        )}
      </div>
      {reactivating && (
        <p className="-mt-3 text-xs text-muted-foreground">
          Leave the password empty to keep their old one.
        </p>
      )}

      <FormGroup
        title="Roles"
        description={
          reactivating
            ? "Leave empty to keep the roles they had."
            : "Roles decide what else they can open. Without one they only get self-service."
        }
      >
        {isLoading ? (
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        ) : roles.length === 0 ? (
          <SectionEmpty icon={ListChecks} title="No roles have been created yet" />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => {
              const on = selected.includes(role.id)
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleRole(role.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg border p-3 text-left text-sm outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      on && "border-primary bg-primary/5 hover:bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                        on && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {on && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{role.name}</span>
                      {role.description && (
                        <span className="block text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </FormGroup>
    </SettingsFormDialog>
  )
}

/* --------------------------------- Salary --------------------------------- */

export function SalaryDialog({
  staff,
  current,
  open,
  onOpenChange,
}: DialogProps & { current: StaffCompensation["current"] }) {
  type Values = z.infer<typeof CompensationSetSchema>
  const initial = (): Values => ({
    id: staff.id,
    basic_salary: current ? String(Number(current.basic_salary)) : "",
    effective_from: current ? today() : staff.hire_date,
    notes: "",
  })
  const form = useForm<Values>({
    resolver: zodResolver(CompensationSetSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const save = useHrAction(
    (data: Values) => setStaffCompensationFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Banknote}
      eyebrow="Basic salary"
      title={current ? "Change salary" : "Set salary"}
      description={
        current
          ? "The current salary ends the day before the new one starts. Use the same start date to correct a mistake."
          : "The monthly basic pay, before allowances and deductions."
      }
      size="sm"
      submitText="Save salary"
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <MoneyField
        label="Basic salary (monthly)"
        name="basic_salary"
        control={form.control}
      />
      <DatePickerField
        label="Starts on"
        name="effective_from"
        control={form.control}
        startDate={new Date(current?.effective_from ?? staff.hire_date)}
        description="Payroll uses the salary in force on the last day of the month"
      />
      <TextareaField
        label="Note"
        name="notes"
        control={form.control}
        required={false}
        placeholder="e.g. Annual review"
      />
    </SettingsFormDialog>
  )
}

/* ----------------------------- Pay components ----------------------------- */

type Choice = { on: boolean; value: string }
const UNCHOSEN: Choice = { on: false, value: "" }

export function StaffComponentsDialog({
  staff,
  assigned,
  open,
  onOpenChange,
}: DialogProps & { assigned: StaffCompensation["components"] }) {
  const { data: components = [], isLoading } = useQuery({
    ...payComponentsQueryOptions(),
    enabled: open,
  })
  // Company-wide components already apply to everyone; only the rest are chosen here.
  const choosable = components.filter((c) => c.is_active && !c.applies_to_all)

  const [choices, setChoices] = useState<Partial<Record<string, Choice>>>({})
  useEffect(() => {
    if (!open) return
    setChoices(
      Object.fromEntries(
        assigned.map((row) => [
          row.component_id,
          { on: true, value: row.value === null ? "" : String(Number(row.value)) },
        ])
      )
    )
  }, [open])

  const save = useHrAction(
    (data: { id: string; components: { component_id: string; value: string }[] }) =>
      setStaffComponentsFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  const setChoice = (id: string, patch: Partial<Choice>) =>
    setChoices((prev) => {
      return { ...prev, [id]: { ...(prev[id] ?? UNCHOSEN), ...patch } }
    })

  const chosen = Object.entries(choices).flatMap(([id, c]) =>
    c?.on ? [{ component_id: id, value: c.value }] : []
  )
  const invalid = chosen.some(
    (c) => c.value !== "" && !/^\d+(\.\d{1,4})?$/.test(c.value)
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ListChecks}
      eyebrow="Pay components"
      title={`Allowances and deductions for ${staff.name}`}
      description="Tick what applies. Leave the amount empty to use the standard value."
      submitText="Save"
      submitDisabled={invalid}
      isSubmitting={save.isPending}
      onSubmit={(event) => {
        event.preventDefault()
        save.run({
          id: staff.id,
          components: chosen,
        })
      }}
    >
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : choosable.length === 0 ? (
        <SectionEmpty
          icon={ListChecks}
          title="No optional pay components"
          description="Add allowances or deductions under HR setup. Company-wide ones already apply to everyone."
        />
      ) : (
        <ul className="divide-y rounded-lg border">
          {choosable.map((component) => {
            const choice: Choice = choices[component.id] ?? UNCHOSEN
            const inputId = `component-${component.id}`
            return (
              <li key={component.id} className="flex flex-wrap items-center gap-3 p-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-primary"
                    checked={choice.on}
                    onChange={(e) => setChoice(component.id, { on: e.target.checked })}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{component.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {COMPONENT_KIND_LABELS[component.kind]} · standard{" "}
                      {formatComponentValue(component, component.default_value)}
                    </span>
                  </span>
                </label>
                {choice.on && (
                  <div className="w-36">
                    <label htmlFor={inputId} className="sr-only">
                      {component.calc_type === "fixed" ? "Amount" : "Percentage"} for{" "}
                      {component.name}
                    </label>
                    <Input
                      id={inputId}
                      inputMode="decimal"
                      value={choice.value}
                      onChange={(e) =>
                        setChoice(component.id, { value: e.target.value.trim() })
                      }
                      placeholder={
                        component.calc_type === "fixed" ? "Own amount" : "Own %"
                      }
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </SettingsFormDialog>
  )
}

/* ----------------------------- Leave balance ------------------------------ */

export function LeaveBalanceDialog({
  staff,
  balance,
  open,
  onOpenChange,
}: DialogProps & { balance: LeaveBalance | undefined }) {
  type Values = z.infer<typeof LeaveBalanceAdjustSchema>
  const initial = (): Values => ({
    staff_id: staff.id,
    leave_type_id: balance?.leave_type_id ?? "",
    year: balance?.year ?? new Date().getFullYear(),
    entitled: Number(balance?.entitled ?? 0),
    carried_forward: Number(balance?.carried_forward ?? 0),
    adjusted: Number(balance?.adjusted ?? 0),
  })
  const form = useForm<Values>({
    resolver: zodResolver(LeaveBalanceAdjustSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open, balance?.leave_type_id])

  const save = useHrAction(
    (data: Values) => adjustLeaveBalanceFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={CalendarClock}
      eyebrow={`${balance?.leave_type_name ?? "Leave"} · ${balance?.year ?? ""}`}
      title={`Adjust ${staff.name}'s balance`}
      description="Days taken and pending come from leave requests and can't be edited here."
      size="sm"
      submitText="Save balance"
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <NumberField label="Entitled days" name="entitled" control={form.control} />
      <NumberField
        label="Carried forward"
        name="carried_forward"
        control={form.control}
        description="Days brought over from last year"
      />
      <NumberField
        label="Adjustment"
        name="adjusted"
        control={form.control}
        description="Extra days added, or a negative number to take days away"
      />
    </SettingsFormDialog>
  )
}

