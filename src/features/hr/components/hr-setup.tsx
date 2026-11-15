import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import {
  CalendarClock,
  CalendarDays,
  ListChecks,
  PencilIcon,
  Percent,
  Plus,
  Trash2,
  XIcon,
} from "lucide-react"
import {
  holidaysQueryOptions,
  leaveTypesQueryOptions,
  payComponentsQueryOptions,
  taxBandsQueryOptions,
} from "../query-options"
import {
  LeaveTypeCreateSchema,
  PayComponentCreateSchema,
  PublicHolidayCreateSchema,
  TaxBandsReplaceSchema,
} from "../schemas"
import {
  createLeaveTypeFn,
  createPayComponentFn,
  createPublicHolidayFn,
  deleteLeaveTypeFn,
  deletePayComponentFn,
  deletePublicHolidayFn,
  replaceTaxBandsFn,
  updateLeaveTypeFn,
  updatePayComponentFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import {
  CALC_TYPE_OPTIONS,
  COMPONENT_KIND_LABELS,
  COMPONENT_KIND_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  formatComponentValue,
  formatDays,
} from "../labels"
import {
  EARLIEST_DATE,
  LoadError,
  OptionalSelectField,
  StatusPill,
} from "./hr-ui"
import type z from "zod"
import type { LeaveType, PayComponent, TaxBand } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  DatePickerField,
  MoneyField,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
} from "@/components/ui/form-fields"
import {
  SectionEmpty,
  SettingsFormDialog,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { formatDate, formatMoney } from "@/lib/format"

type Deleting = { title: string; run: () => void }

function RowActions({
  name,
  onEdit,
  onDelete,
}: {
  name: string
  onEdit?: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 gap-1">
      {onEdit && (
        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${name}`} onClick={onEdit}>
          <PencilIcon />
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${name}`} onClick={onDelete}>
        <Trash2 />
      </Button>
    </div>
  )
}

export function HrSetup() {
  const { hasPermission } = usePermissions()
  const canManage = hasPermission("hr:setup:manage")
  const [deleting, setDeleting] = useState<Deleting>()

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <LeaveTypesSection canManage={canManage} onDelete={setDeleting} />
      <HolidaysSection canManage={canManage} onDelete={setDeleting} />
      <PayComponentsSection canManage={canManage} onDelete={setDeleting} />
      <TaxBandsSection canManage={canManage} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={deleting?.title}
        description="Anything already in use can't be deleted; switch it off instead."
        onConfirm={() => {
          deleting?.run()
          setDeleting(undefined)
        }}
      />
    </div>
  )
}

type SectionProps = { canManage: boolean; onDelete: (deleting: Deleting) => void }

/* ------------------------------ Leave types ------------------------------- */

function LeaveTypesSection({ canManage, onDelete }: SectionProps) {
  const { data = [], isLoading, error } = useQuery(leaveTypesQueryOptions())
  const [editing, setEditing] = useState<LeaveType>()
  const [open, setOpen] = useState(false)
  const remove = useHrAction((id: string) => deleteLeaveTypeFn({ data: { id } }))

  return (
    <SettingsSection
      icon={CalendarClock}
      title="Leave types"
      description="The kinds of leave staff can take and the days allowed each year"
      action={
        canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined)
              setOpen(true)
            }}
          >
            <Plus />
            Add
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <LoadError message={error.message} />
      ) : data.length === 0 ? (
        <SectionEmpty icon={CalendarClock} title="No leave types yet" />
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((type) => (
            <li key={type.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {type.name}
                  {!type.is_active && (
                    <StatusPill tone="grey" className="ml-2">
                      Off
                    </StatusPill>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {type.is_paid
                    ? `${formatDays(type.days_per_year)} a year`
                    : "Unpaid: taken off pay"}
                  {Number(type.carry_forward_max) > 0 &&
                    ` · carry up to ${Number(type.carry_forward_max)}`}
                  {type.applies_to_gender &&
                    ` · ${GENDER_LABELS[type.applies_to_gender].toLowerCase()} staff only`}
                </p>
              </div>
              {canManage && (
                <RowActions
                  name={type.name}
                  onEdit={() => {
                    setEditing(type)
                    setOpen(true)
                  }}
                  onDelete={() =>
                    onDelete({
                      title: `Delete ${type.name}?`,
                      run: () => remove.run(type.id),
                    })
                  }
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <LeaveTypeDialog leaveType={editing} open={open} onOpenChange={setOpen} />
    </SettingsSection>
  )
}

const LeaveTypeFormSchema = LeaveTypeCreateSchema.extend({
  is_active: LeaveTypeCreateSchema.shape.is_paid,
})

function LeaveTypeDialog({
  leaveType,
  open,
  onOpenChange,
}: {
  leaveType?: LeaveType
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof LeaveTypeFormSchema>
  const isEdit = !!leaveType
  const initial = (): Values => ({
    code: leaveType?.code ?? "",
    name: leaveType?.name ?? "",
    days_per_year: Number(leaveType?.days_per_year ?? 0),
    is_paid: leaveType?.is_paid ?? true,
    carry_forward_max: Number(leaveType?.carry_forward_max ?? 0),
    applies_to_gender: leaveType?.applies_to_gender ?? null,
    is_active: leaveType?.is_active ?? true,
  })
  const form = useForm<Values>({
    resolver: zodResolver(LeaveTypeFormSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const save = useHrAction(
    ({ code, is_paid, is_active, ...rest }: Values) =>
      leaveType
        ? updateLeaveTypeFn({ data: { id: leaveType.id, is_active, ...rest } })
        : createLeaveTypeFn({ data: { code, is_paid, ...rest } }),
    { onDone: () => onOpenChange(false) }
  )
  const isPaid = form.watch("is_paid")

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={CalendarClock}
      eyebrow={isEdit ? "Edit leave type" : "New leave type"}
      title={isEdit ? leaveType.name : "Add a leave type"}
      size="sm"
      submitText={isEdit ? "Save changes" : "Add leave type"}
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <TextField label="Name" name="name" control={form.control} placeholder="e.g. Study leave" />
      {!isEdit && (
        <>
          <TextField
            label="Code"
            name="code"
            control={form.control}
            placeholder="e.g. study"
            description="A short id that can't be changed later"
          />
          <SwitchField
            label="Paid leave"
            name="is_paid"
            control={form.control}
            description="Unpaid leave has no yearly allowance; approved days come off pay"
          />
        </>
      )}
      {isPaid && (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Days a year" name="days_per_year" control={form.control} />
          <NumberField
            label="Carry forward up to"
            name="carry_forward_max"
            control={form.control}
            description="Unused days kept for next year"
          />
        </div>
      )}
      <OptionalSelectField
        label="Who can take it"
        name="applies_to_gender"
        control={form.control}
        options={GENDER_OPTIONS.map((o) => ({ ...o, label: `${o.label} staff only` }))}
        noneLabel="Everyone"
      />
      {isEdit && (
        <SwitchField
          label="In use"
          name="is_active"
          control={form.control}
          description="Switch off to stop new requests of this type"
        />
      )}
    </SettingsFormDialog>
  )
}

/* ---------------------------- Public holidays ----------------------------- */

function HolidaysSection({ canManage, onDelete }: SectionProps) {
  const year = new Date().getFullYear()
  const { data = [], isLoading, error } = useQuery(holidaysQueryOptions())
  const [open, setOpen] = useState(false)
  const remove = useHrAction((id: string) => deletePublicHolidayFn({ data: { id } }))
  // This year's and later; older ones no longer affect anything.
  const upcoming = data.filter((h) => h.holiday_date >= `${year}-01-01`)

  type Values = z.infer<typeof PublicHolidayCreateSchema>
  const form = useForm<Values>({
    resolver: zodResolver(PublicHolidayCreateSchema),
    defaultValues: { holiday_date: "", name: "" },
  })
  useEffect(() => {
    if (open) form.reset({ holiday_date: "", name: "" })
  }, [open])
  const add = useHrAction(
    (values: Values) => createPublicHolidayFn({ data: values }),
    { onDone: () => setOpen(false) }
  )

  return (
    <SettingsSection
      icon={CalendarDays}
      title="Public holidays"
      description="Days that don't count as leave or as working days"
      action={
        canManage && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus />
            Add
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <LoadError message={error.message} />
      ) : upcoming.length === 0 ? (
        <SectionEmpty
          icon={CalendarDays}
          title={`No holidays from ${year} on`}
          description="Without them, a holiday inside someone's leave is counted as a leave day."
        />
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {upcoming.map((holiday) => (
            <li key={holiday.id} className="flex items-center gap-3 px-3 py-2">
              <span className="w-32 shrink-0 text-muted-foreground tabular-nums">
                {formatDate(holiday.holiday_date)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{holiday.name}</span>
              {canManage && (
                <RowActions
                  name={holiday.name}
                  onDelete={() =>
                    onDelete({
                      title: `Delete ${holiday.name}?`,
                      run: () => remove.run(holiday.id),
                    })
                  }
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <SettingsFormDialog
        open={open}
        onOpenChange={setOpen}
        icon={CalendarDays}
        eyebrow="Public holiday"
        title="Add a public holiday"
        size="sm"
        submitText="Add holiday"
        isSubmitting={add.isPending}
        onSubmit={form.handleSubmit((values) => add.run(values))}
      >
        <DatePickerField
          label="Date"
          name="holiday_date"
          control={form.control}
          placeholder="Pick a date"
          startDate={EARLIEST_DATE}
        />
        <TextField label="Name" name="name" control={form.control} placeholder="e.g. Independence Day" />
      </SettingsFormDialog>
    </SettingsSection>
  )
}

/* ----------------------------- Pay components ----------------------------- */

function PayComponentsSection({ canManage, onDelete }: SectionProps) {
  const { data = [], isLoading, error } = useQuery(payComponentsQueryOptions())
  const [editing, setEditing] = useState<PayComponent>()
  const [open, setOpen] = useState(false)
  const remove = useHrAction((id: string) => deletePayComponentFn({ data: { id } }))

  return (
    <SettingsSection
      icon={ListChecks}
      title="Pay components"
      description="Allowances, deductions and employer contributions used on payslips"
      action={
        canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined)
              setOpen(true)
            }}
          >
            <Plus />
            Add
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <LoadError message={error.message} />
      ) : data.length === 0 ? (
        <SectionEmpty
          icon={ListChecks}
          title="No pay components yet"
          description="Without any, a payslip is basic salary less tax."
        />
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((component) => (
            <li key={component.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {component.name}
                  {!component.is_active && (
                    <StatusPill tone="grey" className="ml-2">
                      Off
                    </StatusPill>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {COMPONENT_KIND_LABELS[component.kind]} ·{" "}
                  {formatComponentValue(component, component.default_value)} ·{" "}
                  {component.applies_to_all ? "everyone" : "chosen per staff member"}
                  {component.is_statutory && " · statutory"}
                </p>
              </div>
              {canManage && (
                <RowActions
                  name={component.name}
                  onEdit={() => {
                    setEditing(component)
                    setOpen(true)
                  }}
                  onDelete={() =>
                    onDelete({
                      title: `Delete ${component.name}?`,
                      run: () => remove.run(component.id),
                    })
                  }
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <PayComponentDialog component={editing} open={open} onOpenChange={setOpen} />
    </SettingsSection>
  )
}

const PayComponentFormSchema = PayComponentCreateSchema.safeExtend({
  is_active: PayComponentCreateSchema.shape.is_taxable,
})

function PayComponentDialog({
  component,
  open,
  onOpenChange,
}: {
  component?: PayComponent
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof PayComponentFormSchema>
  const isEdit = !!component
  const initial = (): Values => ({
    code: component?.code ?? "",
    name: component?.name ?? "",
    kind: component?.kind ?? "earning",
    calc_type: component?.calc_type ?? "fixed",
    default_value: Number(component?.default_value ?? 0),
    is_taxable: component?.is_taxable ?? true,
    is_pre_tax: component?.is_pre_tax ?? false,
    is_statutory: component?.is_statutory ?? false,
    applies_to_all: component?.applies_to_all ?? false,
    sort_order: component?.sort_order ?? 0,
    is_active: component?.is_active ?? true,
  })
  const form = useForm<Values>({
    resolver: zodResolver(PayComponentFormSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const save = useHrAction(
    ({ code, kind, is_active, ...rest }: Values) =>
      component
        ? updatePayComponentFn({ data: { id: component.id, is_active, ...rest } })
        : createPayComponentFn({ data: { code, kind, ...rest } }),
    { onDone: () => onOpenChange(false) }
  )
  const kind = form.watch("kind")
  const calcType = form.watch("calc_type")

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ListChecks}
      eyebrow={isEdit ? "Edit pay component" : "New pay component"}
      title={isEdit ? component.name : "Add a pay component"}
      submitText={isEdit ? "Save changes" : "Add component"}
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" name="name" control={form.control} placeholder="e.g. Housing allowance" />
        {!isEdit && (
          <TextField
            label="Code"
            name="code"
            control={form.control}
            placeholder="e.g. housing"
            description="A short id that can't be changed later"
          />
        )}
        {!isEdit && (
          <SelectField
            label="Type"
            name="kind"
            control={form.control}
            options={COMPONENT_KIND_OPTIONS}
          />
        )}
        <SelectField
          label="Worked out as"
          name="calc_type"
          control={form.control}
          options={CALC_TYPE_OPTIONS.filter(
            (o) => !(kind === "earning" && o.value === "percent_of_gross")
          )}
        />
        <NumberField
          label={calcType === "fixed" ? "Standard amount" : "Standard percentage"}
          name="default_value"
          control={form.control}
          description="Can be overridden for one staff member"
        />
        <NumberField
          label="Position on the payslip"
          name="sort_order"
          control={form.control}
          description="Lower numbers come first"
        />
      </div>
      <div className="grid gap-3">
        <SwitchField
          label="Applies to everyone"
          name="applies_to_all"
          control={form.control}
          description="Otherwise it is chosen on each staff member's pay"
        />
        {kind === "earning" && (
          <SwitchField
            label="Taxable"
            name="is_taxable"
            control={form.control}
            description="Counted in the pay that tax is worked out on"
          />
        )}
        {kind === "deduction" && (
          <SwitchField
            label="Taken off before tax"
            name="is_pre_tax"
            control={form.control}
            description="Lowers the pay that tax is worked out on"
          />
        )}
        <SwitchField
          label="Statutory"
          name="is_statutory"
          control={form.control}
          description="Required by law, such as NSSF"
        />
        {isEdit && (
          <SwitchField
            label="In use"
            name="is_active"
            control={form.control}
            description="Switch off to leave it out of future payslips"
          />
        )}
      </div>
    </SettingsFormDialog>
  )
}

/* ------------------------------- Tax bands -------------------------------- */

function TaxBandsSection({ canManage }: { canManage: boolean }) {
  const { data = [], isLoading, error } = useQuery(taxBandsQueryOptions())
  const [open, setOpen] = useState(false)

  return (
    <SettingsSection
      icon={Percent}
      title="Income tax bands"
      description="Monthly taxable pay is taxed slice by slice at these rates"
      action={
        canManage && (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <PencilIcon />
            Edit bands
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <LoadError message={error.message} />
      ) : data.length === 0 ? (
        <SectionEmpty
          icon={Percent}
          title="No tax bands"
          description="Payslips are worked out with no income tax until bands are added."
        />
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((band) => (
            <li key={band.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="tabular-nums">
                {band.upper_bound
                  ? `${formatMoney(band.lower_bound)} – ${formatMoney(band.upper_bound)}`
                  : `Above ${formatMoney(band.lower_bound)}`}
              </span>
              <span className="font-medium tabular-nums">{Number(band.rate_percent)}%</span>
            </li>
          ))}
        </ul>
      )}
      <TaxBandsDialog bands={data} open={open} onOpenChange={setOpen} />
    </SettingsSection>
  )
}

function TaxBandsDialog({
  bands,
  open,
  onOpenChange,
}: {
  bands: TaxBand[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof TaxBandsReplaceSchema>
  const plain = (value: string | null) => (value === null ? "" : String(Number(value)))
  const initial = (): Values => ({
    bands: bands.length
      ? bands.map((b) => ({
          lower_bound: plain(b.lower_bound),
          upper_bound: plain(b.upper_bound),
          rate_percent: Number(b.rate_percent),
        }))
      : [{ lower_bound: "0", upper_bound: "", rate_percent: 0 }],
  })
  const form = useForm<Values>({
    resolver: zodResolver(TaxBandsReplaceSchema),
    defaultValues: initial(),
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "bands" })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const save = useHrAction(
    (values: Values) => replaceTaxBandsFn({ data: values }),
    { onDone: () => onOpenChange(false) }
  )

  function addBand() {
    const last = form.getValues("bands").at(-1)
    // A new band starts where the previous one ends.
    append({ lower_bound: last?.upper_bound || "", upper_bound: "", rate_percent: 0 })
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Percent}
      eyebrow="Income tax"
      title="Edit tax bands"
      description="Bands start at 0 and each begins where the one before ends. Leave the last band's upper limit empty."
      size="lg"
      submitText="Save bands"
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <ol className="space-y-3">
        {fields.map((field, index) => (
          <li
            key={field.id}
            className="grid items-start gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_7rem_auto]"
          >
            <MoneyField
              label="From"
              name={`bands.${index}.lower_bound`}
              control={form.control}
            />
            <MoneyField
              label="Up to"
              name={`bands.${index}.upper_bound`}
              control={form.control}
              required={false}
            />
            <NumberField
              label="Rate %"
              name={`bands.${index}.rate_percent`}
              control={form.control}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="sm:mt-6"
              aria-label={`Remove band ${index + 1}`}
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <XIcon />
            </Button>
          </li>
        ))}
      </ol>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={addBand}>
        <Plus />
        Add band
      </Button>
    </SettingsFormDialog>
  )
}
