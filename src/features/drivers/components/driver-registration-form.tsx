import * as React from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Bike,
  Bus,
  BusFront,
  Car,
  Check,
  Cigarette,
  CircleAlert,
  CircleCheck,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  IdCard,
  Loader2,
  Pill,
  Plus,
  Truck,
  Upload,
  UserRound,
  Van,
  X,
} from "lucide-react"
import {
  EDUCATION_LEVELS,
  TEST_STATUSES,
  VEHICLE_TYPES,
  labelFor,
  toOptions,
} from "./driver-options"
import { DEFAULT_DRIVER_POLICY } from "./driver-policy"
import {
  HEALTH_QUESTIONS,
  ageOn,
  buildDriverSchema,
  uncoveredVehicleTypes,
} from "../schemas"
import type { Control, FieldErrors, Path, Resolver } from "react-hook-form"

import type { TestStatus, VehicleType } from "./driver-options"
import type { DriverPolicy } from "./driver-policy"
import type {
  DriverCreateSchemaType,
  DriverFormMode,
  DriverFormValues,
} from "../schemas"
import { Button } from "@/components/ui/button"
import { AvatarField } from "@/components/ui/form-fields"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* API payload                                                         */
/* ------------------------------------------------------------------ */

export type DriverSubmitData = {
  payload: DriverCreateSchemaType
}

/** Throw from `onSubmit` to show server-side validation errors on fields. */
export class ApiFieldErrors extends Error {
  constructor(public errors: { field: string; message: string }[]) {
    super(errors.map((e) => e.message).join("; "))
  }
}

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const toCamel = (s: string) =>
  s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

/** API fields whose form field isn't just the camelCase of the name. */
const API_FIELD_ALIASES: Record<string, string> = {
  is_smoker: "smoker",
  is_drug_user: "drugUser",
}

/**
 * The form field a server error belongs on, e.g.
 * "vehicle_types.0.years_experience" -> "vehicleTypes.0.yearsExperience" and
 * "health.serious_illness.details" -> "seriousIllnessDetails".
 */
export function apiFieldToFormField(field: string) {
  const [root, condition, part] = field.split(".")
  if (root === "health" && condition) {
    const name = toCamel(condition)
    return part === "details" ? `${name}Details` : name
  }
  return API_FIELD_ALIASES[field] ?? field.split(".").map(toCamel).join(".")
}

/** Turns form values into the API body, files included. */
export function toDriverCreatePayload(
  values: DriverFormValues
): DriverSubmitData {
  const v = values as Record<string, unknown>
  const health = Object.fromEntries(
    HEALTH_QUESTIONS.map((q) => {
      const yes = v[q.name] === "yes"
      const details = (
        (v[`${q.name}Details`] as string | undefined) ?? ""
      ).trim()
      return [
        toSnake(q.name),
        { answer: yes, details: yes ? details || null : null },
      ]
    })
  )
  return {
    payload: {
      full_name: values.fullName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      avatar: values.avatar ?? undefined,
      national_id: values.nationalId.trim(),
      date_of_birth: values.dateOfBirth,
      yard_id: values.yardId,
      vehicle_types: values.vehicleTypes.map((t) => ({
        vehicle_type: t.vehicleType,
        years_experience: t.yearsExperience,
      })),
      education: values.education,
      is_smoker: values.smoker,
      is_drug_user: values.drugUser,
      license_number: values.licenseNumber.trim(),
      license_classes: values.licenseClasses,
      license_expiry: values.licenseExpiry,
      health,
      drug_alcohol_test: values.drugAlcoholTest,
      skills_test: values.skillsTest,
      practical_test: values.practicalTest,
      driver_confirmed: values.driverConfirmed,
      // Required when registering, which the form has already checked. When
      // editing it is left out unless a new copy was chosen.
      license_copy: values.licenseCopy as File,
      signed_questionnaire: values.signedQuestionnaire,
    },
  }
}

/* ------------------------------------------------------------------ */
/* Sections (drive the side navigation and progress)                   */
/* ------------------------------------------------------------------ */

type IconType = React.ComponentType<{ className?: string }>
type Values = Record<string, unknown>

type SectionDef = {
  id: string
  title: string
  icon: IconType
  /** Fields that must be filled for the section to count as done. */
  required: string[]
  optional?: boolean
}

const SECTIONS: SectionDef[] = [
  {
    id: "details",
    title: "Driver details",
    icon: UserRound,
    required: [
      "fullName",
      "phone",
      "email",
      "nationalId",
      "dateOfBirth",
      "yardId",
    ],
  },
  {
    id: "experience",
    title: "Vehicles & experience",
    icon: GraduationCap,
    required: ["vehicleTypes", "education"],
  },
  {
    id: "licence",
    title: "Driving licence",
    icon: IdCard,
    required: [
      "licenseNumber",
      "licenseClasses",
      "licenseExpiry",
      "licenseCopy",
    ],
  },
  {
    id: "health",
    title: "Health screening",
    icon: HeartPulse,
    required: HEALTH_QUESTIONS.map((q) => q.name),
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    icon: Cigarette,
    required: [],
    optional: true,
  },
  {
    id: "tests",
    title: "Selection tests",
    icon: FlaskConical,
    required: [],
    optional: true,
  },
  {
    id: "confirmation",
    title: "Confirmation",
    icon: FileCheck2,
    required: ["driverConfirmed"],
  },
]

/** Lists count once non-empty, with every field of every row filled. */
const isFilled = (v: unknown): boolean => {
  if (Array.isArray(v)) {
    return (
      v.length > 0 &&
      v.every((item) =>
        item && typeof item === "object"
          ? Object.values(item).every(isFilled)
          : isFilled(item)
      )
    )
  }
  return v !== undefined && v !== null && v !== "" && v !== false
}

type RequiredOptions = { mode: DriverFormMode; requireYard: boolean }

function requiredFields(
  section: SectionDef,
  { mode, requireYard }: RequiredOptions
) {
  return section.required.filter(
    (f) =>
      !(mode === "edit" && f === "licenseCopy") &&
      !(!requireYard && f === "yardId")
  )
}

function sectionState(
  section: SectionDef,
  values: Values,
  errors: FieldErrors<DriverFormValues>,
  options: RequiredOptions
): "done" | "error" | "todo" {
  const errorKeys = Object.keys(errors)
  const required = requiredFields(section, options)
  const fields = [
    ...section.required,
    ...(section.id === "health"
      ? HEALTH_QUESTIONS.map((q) => `${q.name}Details`)
      : []),
  ]
  if (fields.some((f) => errorKeys.includes(f))) return "error"
  if (required.every((f) => isFilled(values[f]))) return "done"
  return "todo"
}

/* ------------------------------------------------------------------ */
/* Field helpers                                                       */
/* ------------------------------------------------------------------ */

type C = Control<DriverFormValues>
type N = Path<DriverFormValues>

type BaseProps = {
  control: C
  name: N
  label: string
  description?: string
  className?: string
}

function TextField({
  control,
  name,
  label,
  description,
  className,
  ...input
}: BaseProps &
  Omit<
    React.ComponentProps<typeof Input>,
    "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
  >) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...input}
            id={name}
            name={field.name}
            ref={field.ref}
            value={(field.value as string | undefined) ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

function NumberField({
  control,
  name,
  label,
  description,
  className,
  suffix,
}: BaseProps & { suffix?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <div className="relative">
            <Input
              id={name}
              type="number"
              inputMode="numeric"
              min={0}
              name={field.name}
              ref={field.ref}
              className={cn(suffix && "pr-14")}
              value={(field.value as number | undefined) ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            />
            {suffix && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

function SelectField({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder,
}: BaseProps & {
  options: readonly { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            name={field.name}
            value={(field.value as string | undefined) || undefined}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={name}
              className="w-full"
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

/** Drop-zone style single-file picker that shows the chosen file. */
function FileField({
  control,
  name,
  label,
  description,
  className,
}: BaseProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const file = field.value as File | undefined
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove file"
                  onClick={() => field.onChange(undefined)}
                >
                  <X />
                </Button>
              </div>
            ) : (
              <label
                htmlFor={name}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5",
                  fieldState.invalid && "border-destructive/60"
                )}
              >
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload</span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG or PDF · up to 5MB
                </span>
              </label>
            )}
            <input
              id={name}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="sr-only"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              onChange={(e) => {
                field.onChange(e.target.files?.[0])
                e.target.value = ""
              }}
              aria-invalid={fieldState.invalid}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}

/** Checkbox presented as a selectable card. */
function CheckCard({
  control,
  name,
  label,
  description,
  icon: Icon,
}: Omit<BaseProps, "className"> & { icon?: IconType }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const checked = Boolean(field.value)
        return (
          <div className="space-y-1.5">
            <label
              htmlFor={name}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3.5 transition-colors hover:bg-muted/40",
                checked && "border-primary/40 bg-primary/5",
                fieldState.invalid && "border-destructive/60"
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors",
                    checked && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                {description && (
                  <span className="block text-xs text-muted-foreground">
                    {description}
                  </span>
                )}
              </span>
              <Checkbox
                id={name}
                name={field.name}
                className="mt-0.5"
                checked={checked}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </label>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </div>
        )
      }}
    />
  )
}

/** Segmented single-choice control. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  labelledBy,
  invalid,
  tone,
  divided,
}: {
  value: T | undefined
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
  labelledBy: string
  invalid?: boolean
  /** Optional per-value classes applied when that value is selected. */
  tone?: Partial<Record<T, string>>
  /** Draw a thin divider between the options. */
  divided?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-invalid={invalid}
      className={cn(
        "inline-flex shrink-0 rounded-lg border bg-muted/50 p-0.5",
        invalid && "border-destructive/60"
      )}
    >
      {options.map((o, i) => {
        const selected = value === o.value
        return (
          <React.Fragment key={o.value}>
            {divided && i > 0 && (
              <span
                aria-hidden
                className="mx-0.5 my-1.5 w-px shrink-0 self-stretch bg-border"
              />
            )}
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                selected &&
                  (tone?.[o.value] ??
                    "bg-primary text-primary-foreground shadow-xs")
              )}
            >
              {o.label}
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )
}

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const

function HealthQuestion({
  control,
  name,
  label,
  index,
}: {
  control: C
  name: string
  label: string
  index: number
}) {
  const answer = useWatch({ control, name: name as N })
  const labelId = `${name}-label`
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <Controller
        control={control}
        name={name as N}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <div>
                <p id={labelId} className="text-sm leading-snug">
                  {label}
                </p>
                {fieldState.invalid && (
                  <FieldError className="mt-1" errors={[fieldState.error]} />
                )}
              </div>
            </div>
            <div className="pl-9 sm:pl-0">
              <Segmented
                labelledBy={labelId}
                value={field.value as "yes" | "no" | undefined}
                options={YES_NO}
                divided
                invalid={fieldState.invalid}
                onChange={(v) => {
                  field.onChange(v)
                  field.onBlur()
                }}
              />
            </div>
          </div>
        )}
      />
      {answer === "yes" && (
        <Controller
          control={control}
          name={`${name}Details` as N}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="mt-3 pl-9">
              <Textarea
                id={`${name}Details`}
                name={field.name}
                ref={field.ref}
                rows={2}
                value={(field.value as string | undefined) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Describe the condition and how it is managed"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}
    </li>
  )
}

export const VEHICLE_ICONS: Record<VehicleType, IconType> = {
  motorcycle: Bike,
  car: Car,
  pickup_van: Van,
  minibus: BusFront,
  truck: Truck,
  bus: Bus,
}

const emptyVehicle = {
  vehicleType: undefined,
  yearsExperience: undefined,
} as unknown as { vehicleType: VehicleType; yearsExperience: number }

/**
 * One row per vehicle type the driver can be assigned, each with its own
 * years of experience. A type can only be picked once.
 */
function VehiclesField({
  control,
  minExperienceYears,
}: {
  control: C
  minExperienceYears: number
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicleTypes",
  })
  const vehicles: { vehicleType?: VehicleType }[] = useWatch({
    control,
    name: "vehicleTypes",
  })
  const used = vehicles.map((v) => v.vehicleType).filter(Boolean)
  const allUsed = used.length >= VEHICLE_TYPES.length

  return (
    <Controller
      control={control}
      name="vehicleTypes"
      render={({ fieldState }) => (
        <div className="space-y-3">
          <ul className="space-y-3">
            {fields.map((row, index) => {
              const current = vehicles[index]?.vehicleType
              const Icon = current ? VEHICLE_ICONS[current] : Car
              return (
                <li
                  key={row.id}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <span
                    className={cn(
                      "mt-6 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
                      current && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                    <Controller
                      control={control}
                      name={`vehicleTypes.${index}.vehicleType`}
                      render={({ field, fieldState: typeState }) => (
                        <Field data-invalid={typeState.invalid}>
                          <FieldLabel
                            htmlFor={`vehicleTypes-${index}-vehicleType`}
                          >
                            Vehicle type
                          </FieldLabel>
                          <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id={`vehicleTypes-${index}-vehicleType`}
                              className="w-full"
                              aria-invalid={typeState.invalid}
                              onBlur={field.onBlur}
                            >
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {VEHICLE_TYPES.map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  // Each type once; keep this row's own choice.
                                  disabled={
                                    type !== current && used.includes(type)
                                  }
                                >
                                  {labelFor("vehicleType", type)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {typeState.invalid && (
                            <FieldError errors={[typeState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <NumberField
                      control={control}
                      name={`vehicleTypes.${index}.yearsExperience`}
                      label="Experience"
                      suffix="years"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label={`Remove ${current ? labelFor("vehicleType", current) : "vehicle type"}`}
                  >
                    <X />
                  </Button>
                </li>
              )
            })}
          </ul>
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            disabled={allUsed}
            onClick={() => append(emptyVehicle, { shouldFocus: false })}
          >
            <Plus />
            Add vehicle type
          </Button>
          <p className="text-xs text-muted-foreground">
            Add every vehicle type the driver can be assigned, with at least{" "}
            {minExperienceYears} years of experience on each.
          </p>
          {fieldState.error?.message && (
            <FieldError errors={[fieldState.error]} />
          )}
        </div>
      )}
    />
  )
}

/**
 * The categories the licence covers. Categories needed for the driver's
 * vehicle types are marked, and any that are missing are flagged.
 */
function LicenceCategoriesField({
  control,
  needed,
}: {
  control: C
  needed: VehicleType[]
}) {
  return (
    <Controller
      control={control}
      name="licenseClasses"
      render={({ field, fieldState }) => {
        const selected: VehicleType[] = field.value
        const missing = uncoveredVehicleTypes(needed, selected)
        const toggle = (type: VehicleType) => {
          field.onChange(
            selected.includes(type)
              ? selected.filter((t) => t !== type)
              : [...selected, type]
          )
          field.onBlur()
        }
        return (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <FieldLabel id="licenseClasses-label">
                Licence categories
              </FieldLabel>
              {missing.length > 0 && (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    field.onChange([...new Set([...selected, ...missing])])
                    field.onBlur()
                  }}
                >
                  Add{" "}
                  {missing.map((t) => labelFor("vehicleType", t)).join(", ")}
                </button>
              )}
            </div>
            <div
              role="group"
              aria-labelledby="licenseClasses-label"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {VEHICLE_TYPES.map((type) => {
                const Icon = VEHICLE_ICONS[type]
                const isSelected = selected.includes(type)
                const isNeeded = needed.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggle(type)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50",
                      isSelected &&
                        "border-primary bg-primary/5 hover:bg-primary/5",
                      isNeeded &&
                        !isSelected &&
                        "border-dashed border-destructive/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                        isSelected &&
                          "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <Icon
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground",
                        isSelected && "text-primary"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {labelFor("vehicleType", type)}
                      </span>
                      {isNeeded && (
                        <span
                          className={cn(
                            "block text-[11px]",
                            isSelected
                              ? "text-muted-foreground"
                              : "text-destructive"
                          )}
                        >
                          {isSelected ? "Drives this" : "Needed"}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
            <FieldDescription>
              Select every category the licence covers. It must cover each
              vehicle type the driver can be assigned.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}

const TEST_TONES: Partial<Record<TestStatus, string>> = {
  passed:
    "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-emerald-950",
  failed: "bg-destructive text-white shadow-xs",
}

function TestResultRow({
  control,
  name,
  label,
  description,
}: {
  control: C
  name: N
  label: string
  description: string
}) {
  const labelId = `${name}-label`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p id={labelId} className="text-sm font-medium">
              {label}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Segmented
            labelledBy={labelId}
            value={field.value as TestStatus}
            options={
              toOptions("testStatus", TEST_STATUSES) as {
                value: TestStatus
                label: string
              }[]
            }
            onChange={field.onChange}
            tone={TEST_TONES}
          />
        </div>
      )}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

/** Id of the section being worked on, shared with the cards and the nav. */
const ActiveSectionContext = React.createContext<string | null>(null)

const SECTION_PREFIX = "section-"
/** Distance from the viewport top where a section counts as "current". */
const SPY_OFFSET = 140

const sectionIdOf = (el: Element | null) =>
  el
    ?.closest(`section[id^="${SECTION_PREFIX}"]`)
    ?.id.slice(SECTION_PREFIX.length) ?? null

/**
 * Tracks the active section: the one holding keyboard focus, otherwise the
 * one scrolled to the top of the viewport (the last one at the page bottom).
 */
function useActiveSection(formRef: React.RefObject<HTMLFormElement | null>) {
  const [activeId, setActiveId] = React.useState(SECTIONS[0].id)
  const focusedId = React.useRef<string | null>(null)
  const pinnedUntil = React.useRef(0)

  React.useEffect(() => {
    const form = formRef.current
    if (!form) return
    let frame = 0

    const fromScroll = () => {
      frame = 0
      if (Date.now() < pinnedUntil.current) return
      const els = SECTIONS.map((s) =>
        document.getElementById(SECTION_PREFIX + s.id)
      )
      if (focusedId.current) {
        const rect = document
          .getElementById(SECTION_PREFIX + focusedId.current)
          ?.getBoundingClientRect()
        if (rect && rect.bottom > 0 && rect.top < window.innerHeight) return
      }
      const last = els.at(-1)?.getBoundingClientRect()
      if (
        last &&
        last.bottom <= window.innerHeight + 2 &&
        last.top < window.innerHeight * 0.75
      ) {
        setActiveId(SECTIONS.at(-1)!.id)
        return
      }
      // The section whose top is closest above the line; ties (sections side
      // by side) go to the earlier step.
      // Widened on purpose: TS can't see the assignment inside forEach.
      let best = null as string | null
      let bestTop = -Infinity
      els.forEach((el, i) => {
        const top = el?.getBoundingClientRect().top
        if (top === undefined || top > SPY_OFFSET) return
        if (top > bestTop + 1) {
          bestTop = top
          best = SECTIONS[i].id
        }
      })
      setActiveId(best ?? SECTIONS[0].id)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(fromScroll)
    }
    const onFocusIn = (e: FocusEvent) => {
      const id = sectionIdOf(e.target as Element)
      focusedId.current = id
      if (id) setActiveId(id)
    }
    const onFocusOut = (e: FocusEvent) => {
      if (!form.contains(e.relatedTarget as Node | null)) {
        focusedId.current = null
      }
    }

    // Capture so scrolling inside any scroll container is seen too.
    window.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    })
    window.addEventListener("resize", onScroll, { passive: true })
    form.addEventListener("focusin", onFocusIn)
    form.addEventListener("focusout", onFocusOut)
    fromScroll()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll, { capture: true })
      window.removeEventListener("resize", onScroll)
      form.removeEventListener("focusin", onFocusIn)
      form.removeEventListener("focusout", onFocusOut)
    }
  }, [formRef])

  /** Jump to a section and keep it highlighted while the scroll settles. */
  const goTo = React.useCallback((id: string) => {
    pinnedUntil.current = Date.now() + 900
    focusedId.current = null
    setActiveId(id)
    document
      .getElementById(SECTION_PREFIX + id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return { activeId, goTo }
}

function FormSection({
  id,
  description,
  aside,
  className,
  children,
}: {
  id: string
  description?: React.ReactNode
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const index = SECTIONS.findIndex((s) => s.id === id)
  const section = SECTIONS[index]
  const Icon = section.icon
  const isActive = React.useContext(ActiveSectionContext) === id
  return (
    <section
      id={`section-${section.id}`}
      data-active={isActive || undefined}
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "flex scroll-mt-20 flex-col rounded-xl border bg-card shadow-xs transition-[box-shadow,border-color] duration-300",
        isActive && "border-primary/40 shadow-md ring-1 ring-primary/15",
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors duration-300",
              isActive && "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Step {index + 1}
              {section.optional && " · optional"}
            </p>
            <h2 className="text-base leading-tight font-semibold">
              {section.title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {aside}
      </header>
      <div className="flex-1 px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

function SectionNav({
  states,
  activeId,
  onNavigate,
}: {
  states: Record<string, "done" | "error" | "todo">
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav aria-label="Form sections" className="space-y-0.5">
      {SECTIONS.map((s, i) => {
        const state = states[s.id]
        const isActive = activeId === s.id
        return (
          <a
            key={s.id}
            href={`#section-${s.id}`}
            aria-current={isActive ? "step" : undefined}
            onClick={(e) => {
              e.preventDefault()
              onNavigate(s.id)
            }}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted",
              isActive && "bg-primary/10 hover:bg-primary/10"
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                state === "done" &&
                  "border-primary bg-primary text-primary-foreground",
                state === "error" &&
                  "border-destructive bg-destructive text-white",
                state === "todo" &&
                  (isActive
                    ? "border-primary text-primary"
                    : "text-muted-foreground")
              )}
            >
              {state === "done" ? (
                <Check className="size-3.5" />
              ) : state === "error" ? (
                "!"
              ) : (
                i + 1
              )}
            </span>
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-y-1.5 -left-px w-0.5 rounded-full bg-primary"
              />
            )}
            <span
              className={cn(
                "truncate",
                state === "todo" && !isActive
                  ? "text-muted-foreground group-hover:text-foreground"
                  : cn(
                      "font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )
              )}
            >
              {s.title}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

/** Yard picker; with no yards set up it says so instead of an empty list. */
function YardField({ control, yards }: { control: C; yards: Yard[] }) {
  return (
    <Controller
      control={control}
      name="yardId"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="yardId">Yard</FieldLabel>
          <Select
            name={field.name}
            value={field.value ? String(field.value) : undefined}
            onValueChange={(v) => field.onChange(Number(v))}
            disabled={yards.length === 0}
          >
            <SelectTrigger
              id="yardId"
              className="w-full"
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
            >
              <SelectValue
                placeholder={
                  yards.length === 0 ? "No yards set up" : "Select yard"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {yards.map((y) => (
                <SelectItem key={y.id} value={String(y.id)}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

function AgeBadge({
  dob,
  policy,
}: {
  dob: string | undefined
  policy: DriverPolicy
}) {
  if (!dob || Number.isNaN(new Date(dob).getTime())) return null
  const age = ageOn(dob)
  const ok = age >= policy.minAge && age <= policy.maxAge
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        ok ? "text-muted-foreground" : "text-destructive"
      )}
    >
      {ok ? (
        <CircleCheck className="size-3.5" />
      ) : (
        <CircleAlert className="size-3.5" />
      )}
      Age {age}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

const healthDefaults = Object.fromEntries(
  HEALTH_QUESTIONS.map((q) => [`${q.name}Details`, ""])
)

export type Yard = { id: number; name: string }

type DriverRegistrationFormProps = {
  /** "edit" prefills from `initialValues` and relaxes the licence upload. */
  mode?: DriverFormMode
  /** Current rules from system settings. Defaults to DEFAULT_DRIVER_POLICY. */
  policy?: DriverPolicy
  /** Yards the driver can be based at. Empty until yards are set up. */
  yards?: Yard[]
  defaultYardId?: number
  initialValues?: Partial<DriverFormValues>
  /** The driver's saved profile photo, when editing. */
  avatarSrc?: string | null
  /**
   * Save the driver. Throw ApiFieldErrors to show server-side errors on the
   * matching fields; any other error shows a banner above the actions.
   */
  onSubmit?: (data: DriverSubmitData) => void | Promise<void>
  onCancel?: () => void
  /** For mutations that don't return a promise (e.g. `mutate`). */
  isSubmitting?: boolean
}

export function DriverRegistrationForm({
  mode = "create",
  policy = DEFAULT_DRIVER_POLICY,
  yards = [],
  defaultYardId,
  initialValues,
  avatarSrc,
  onSubmit,
  onCancel,
  isSubmitting: isSubmittingProp = false,
}: DriverRegistrationFormProps) {
  const isEdit = mode === "edit"
  const { minAge, maxAge, minExperienceYears } = policy
  const requireYard = yards.length > 0
  const schema = React.useMemo(
    () =>
      buildDriverSchema({ minAge, maxAge, minExperienceYears }, mode, {
        requireYard,
      }),
    [minAge, maxAge, minExperienceYears, mode, requireYard]
  )
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<DriverFormValues>,
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      nationalId: "",
      dateOfBirth: "",
      yardId: defaultYardId ?? (yards.length === 1 ? yards[0].id : undefined),
      vehicleTypes: [emptyVehicle],
      licenseClasses: [],
      smoker: false,
      drugUser: false,
      licenseNumber: "",
      licenseExpiry: "",
      drugAlcoholTest: "pending",
      skillsTest: "pending",
      practicalTest: "pending",
      driverConfirmed: false,
      ...healthDefaults,
      ...initialValues,
    } as Partial<DriverFormValues>,
  })
  const { control } = form
  const formRef = React.useRef<HTMLFormElement>(null)
  const { activeId, goTo } = useActiveSection(formRef)
  const values = useWatch({ control }) as Values
  const { errors } = form.formState
  const isSubmitting = form.formState.isSubmitting || isSubmittingProp

  const states = Object.fromEntries(
    SECTIONS.map((s) => [
      s.id,
      sectionState(s, values, errors, { mode, requireYard }),
    ])
  ) as Record<string, "done" | "error" | "todo">
  const doneCount = SECTIONS.filter((s) => states[s.id] === "done").length
  const progress = Math.round((doneCount / SECTIONS.length) * 100)

  const answeredHealth = HEALTH_QUESTIONS.filter((q) =>
    isFilled(values[q.name])
  ).length
  const yesCount = HEALTH_QUESTIONS.filter(
    (q) => values[q.name] === "yes"
  ).length
  const testsDone = (
    ["drugAlcoholTest", "skillsTest", "practicalTest"] as const
  )
    .map((k) => values[k])
    .filter((v) => v !== "pending").length

  // Vehicle types the licence has to cover, and the ones it doesn't yet.
  const neededCategories = [
    ...new Set(
      ((values.vehicleTypes ?? []) as { vehicleType?: VehicleType }[])
        .map((v) => v.vehicleType)
        .filter((t): t is VehicleType => !!t)
    ),
  ]
  const licenseCategories = (values.licenseClasses ?? []) as VehicleType[]
  const missingCategories = uncoveredVehicleTypes(
    neededCategories,
    licenseCategories
  )

  const handleSubmit = async (data: DriverFormValues) => {
    form.clearErrors("root")
    try {
      await onSubmit?.(toDriverCreatePayload(data))
    } catch (e) {
      if (e instanceof ApiFieldErrors) {
        e.errors.forEach((err) =>
          err.field
            ? form.setError(apiFieldToFormField(err.field) as N, {
                type: "server",
                message: err.message,
              })
            : // Not tied to one field.
              form.setError("root.server", {
                type: "server",
                message: err.message,
              })
        )
        handleInvalid(form.formState.errors)
      } else {
        form.setError("root.server", {
          type: "server",
          message:
            e instanceof Error
              ? e.message
              : isEdit
                ? "Couldn't save the driver. Try again."
                : "Couldn't register the driver. Try again.",
        })
      }
    }
  }

  const handleInvalid = (errs: FieldErrors<DriverFormValues>) => {
    // Bring the first section with a problem into view.
    const keys = Object.keys(errs)
    const first = SECTIONS.find((s) =>
      [
        ...requiredFields(s, { mode, requireYard }),
        ...(s.id === "health"
          ? HEALTH_QUESTIONS.map((q) => `${q.name}Details`)
          : []),
      ].some((f) => keys.includes(f))
    )
    if (first) goTo(first.id)
  }

  return (
    <ActiveSectionContext.Provider value={activeId}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
        noValidate
      >
        {/* Side navigation */}
        <aside className="hidden lg:sticky lg:top-16 lg:block">
          <div className="mb-4 px-2.5">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground tabular-nums">
                {doneCount}/{SECTIONS.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <SectionNav states={states} activeId={activeId} onNavigate={goTo} />
        </aside>

        <div className="grid min-w-0 items-stretch gap-5 xl:grid-cols-2">
          <FormSection
            id="details"
            className="xl:col-span-2"
            description={`Drivers must be ${minAge}–${maxAge} years old at registration.`}
          >
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <AvatarField
                control={control}
                name="avatar"
                nameField="fullName"
                label="Profile photo"
                src={avatarSrc}
                className="sm:col-span-2 2xl:col-span-4"
              />
              <TextField
                control={control}
                name="fullName"
                label="Full name"
                placeholder="e.g. John Okello"
                autoComplete="name"
                className="sm:col-span-2"
              />
              <TextField
                control={control}
                name="phone"
                label="Phone number"
                placeholder="07XX XXX XXX"
                type="tel"
                autoComplete="tel"
              />
              <TextField
                control={control}
                name="email"
                label="Email address"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
              />
              <TextField
                control={control}
                name="nationalId"
                label="National ID number"
                placeholder="NIN"
                className="[&_input]:uppercase"
              />
              <div className="relative">
                <TextField
                  control={control}
                  name="dateOfBirth"
                  label="Date of birth"
                  type="date"
                />
                <span className="absolute top-0 right-0">
                  <AgeBadge
                    dob={values.dateOfBirth as string | undefined}
                    policy={policy}
                  />
                </span>
              </div>
              {/* <YardField control={control} yards={yards} /> */}
            </div>
          </FormSection>

          <FormSection
            id="experience"
            description="Every vehicle type the driver can be assigned, and their background."
            aside={
              neededCategories.length > 0 && (
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {neededCategories.length}{" "}
                  <span className="font-normal text-muted-foreground">
                    {neededCategories.length === 1 ? "type" : "types"}
                  </span>
                </span>
              )
            }
          >
            <div className="space-y-5">
              <VehiclesField
                control={control}
                minExperienceYears={minExperienceYears}
              />
              <SelectField
                control={control}
                name="education"
                label="Highest education level"
                description="O'Level with a driving course is preferred."
                options={toOptions("education", EDUCATION_LEVELS)}
                placeholder="Select level"
              />
            </div>
          </FormSection>

          <FormSection
            id="licence"
            description="One licence can cover several categories. It must cover every vehicle type the driver can be assigned."
            aside={
              neededCategories.length > 0 &&
              licenseCategories.length > 0 && (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                    missingCategories.length === 0
                      ? "text-foreground"
                      : "border-destructive/40 text-destructive"
                  )}
                >
                  {missingCategories.length === 0 ? (
                    <CircleCheck className="size-3.5" />
                  ) : (
                    <CircleAlert className="size-3.5" />
                  )}
                  {missingCategories.length === 0
                    ? "Covers all vehicle types"
                    : `Missing ${missingCategories.length}`}
                </span>
              )
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 mb-3">
              <TextField
                control={control}
                name="licenseNumber"
                label="Licence number"
                className="[&_input]:font-mono [&_input]:uppercase"
              />
              <TextField
                control={control}
                name="licenseExpiry"
                label="Expiry date"
                type="date"
              />
              <div className="sm:col-span-2">
                <LicenceCategoriesField
                  control={control}
                  needed={neededCategories}
                />
              </div>
            </div>
             <FileField
                control={control}
                name="licenseCopy"
                label="Licence photocopy"
                description={
                  isEdit
                    ? "Upload only to replace the copy on file."
                    : "Kept in the driver's portfolio. JPG, PNG or PDF, up to 5MB."
                }
              />
          </FormSection>

          <FormSection
            id="health"
            className="xl:col-span-2"
            description='Record any disability or impairment the driver discloses. Add details for every "Yes".'
            aside={
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {answeredHealth}/{HEALTH_QUESTIONS.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {yesCount > 0 ? `${yesCount} flagged` : "answered"}
                </p>
              </div>
            }
          >
            <ol className="divide-y">
              {HEALTH_QUESTIONS.map((q, i) => (
                <HealthQuestion
                  key={q.name}
                  control={control}
                  name={q.name}
                  label={q.label}
                  index={i}
                />
              ))}
            </ol>
          </FormSection>

          <FormSection
            id="lifestyle"
            description="Tick all that apply to the driver."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckCard
                control={control}
                name="smoker"
                label="Smokes"
                description="Driver is a smoker"
                icon={Cigarette}
              />
              <CheckCard
                control={control}
                name="drugUser"
                label="Uses drugs"
                description="Driver uses recreational drugs"
                icon={Pill}
              />
            </div>
          </FormSection>

          <FormSection
            id="tests"
            description="Leave as Pending until each test is done."
            aside={
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {testsDone}/3
              </span>
            }
          >
            <div className="divide-y">
              <TestResultRow
                control={control}
                name="drugAlcoholTest"
                label="Drug and alcohol test"
                description="Screening for substances"
              />
              <TestResultRow
                control={control}
                name="skillsTest"
                label="Driving skills test"
                description="Theory and road knowledge"
              />
              <TestResultRow
                control={control}
                name="practicalTest"
                label="Practical driving test"
                description="On-road assessment"
              />
            </div>
          </FormSection>

          <FormSection
            id="confirmation"
            className="xl:col-span-2"
            description="The driver signs the health screening questionnaire. Upload the signed copy once selection is complete."
          >
            <div className="space-y-4">
              <CheckCard
                control={control}
                name="driverConfirmed"
                label="The driver has confirmed this information is true and complete."
                icon={FileCheck2}
              />
              <FileField
                control={control}
                name="signedQuestionnaire"
                label="Signed questionnaire"
                description="Optional for now — scan or photo of the signed copy."
              />
            </div>
          </FormSection>

          {errors.root?.server && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm xl:col-span-2"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  {isEdit
                    ? "Couldn't save the driver"
                    : "Couldn't register the driver"}
                </p>
                <p className="text-muted-foreground">
                  {errors.root.server.message}
                </p>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl border bg-background/95 px-5 py-3 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80 xl:col-span-2">
            <div className="min-w-0 text-sm">
              <p className="font-medium">
                {doneCount === SECTIONS.length
                  ? isEdit
                    ? "Ready to save"
                    : "Ready to register"
                  : `${doneCount} of ${SECTIONS.length} steps complete`}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {isEdit
                  ? `Editing ${String(values.fullName || "driver")}`
                  : values.fullName
                    ? String(values.fullName)
                    : "New driver registration"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Check />
                )}
                {isSubmitting
                  ? isEdit
                    ? "Saving…"
                    : "Registering…"
                  : isEdit
                    ? "Save changes"
                    : "Register driver"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </ActiveSectionContext.Provider>
  )
}
