import * as React from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import type { Control, FieldErrors, Path, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Bike,
  Bus,
  BusFront,
  Car,
  Check,
  CircleAlert,
  CircleCheck,
  Cigarette,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  IdCard,
  Loader2,
  Pill,
  Truck,
  Upload,
  UserRound,
  Van,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
/* Config                                                              */
/* ------------------------------------------------------------------ */

const MIN_AGE = 25
const MAX_AGE = 55
const MIN_EXPERIENCE_YEARS = 2
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILES = ["image/jpeg", "image/png", "application/pdf"]

const VEHICLE_TYPES = [
  "Motorcycle",
  "Car",
  "Pickup / Van",
  "Minibus",
  "Truck",
  "Bus",
] as const
const EDUCATION_LEVELS = [
  "Primary",
  "O'Level",
  "O'Level with a driving course",
  "A'Level",
  "Diploma",
  "Degree",
] as const

const HEALTH_QUESTIONS = [
  {
    name: "vision",
    label:
      "Does the driver have vision problems (eyesight or colour blindness)?",
  },
  {
    name: "seriousIllness",
    label: "Does the driver have any serious illness?",
  },
  {
    name: "neuroMusculoskeletal",
    label:
      "Does the driver have a neurological or musculoskeletal condition that could affect movement and reaction time?",
  },
  {
    name: "suddenCollapse",
    label:
      "Does the driver have a condition that could cause sudden collapse (e.g. epilepsy, diabetes, heart attack)?",
  },
  {
    name: "anxietyDepression",
    label: "Does the driver have a history of anxiety or depression?",
  },
  { name: "medication", label: "Does the driver use any medication?" },
  {
    name: "stressSleep",
    label: "Does the driver have stress or sleeping disorders?",
  },
] as const

const TEST_STATUSES = ["Pending", "Passed", "Failed"] as const

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

const yesNo = z.enum(["yes", "no"], { message: "Please answer this question" })

const ageOn = (dob: string, on = new Date()) => {
  const d = new Date(dob)
  let age = on.getFullYear() - d.getFullYear()
  const m = on.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--
  return age
}

const healthShape = Object.fromEntries(
  HEALTH_QUESTIONS.flatMap((q) => [
    [q.name, yesNo],
    [`${q.name}Details`, z.string().optional()],
  ])
) as Record<string, z.ZodTypeAny>

export type DriverFormMode = "create" | "edit"

const licenseCopyFile = z
  .instanceof(File, { message: "Upload a photocopy of the licence" })
  .refine((f) => f.size <= MAX_FILE_SIZE, "File must be 5MB or smaller")
  .refine((f) => ACCEPTED_FILES.includes(f.type), "Upload a JPG, PNG or PDF")

/**
 * In edit mode the licence copy is already in the driver's portfolio, so a
 * new upload is optional.
 */
function buildDriverSchema(mode: DriverFormMode) {
  return z
    .object({
      fullName: z.string().min(2, "Enter the driver's full name"),
      phone: z.string().min(9, "Enter a valid phone number"),
      nationalId: z.string().min(5, "Enter the national ID number"),
      dateOfBirth: z
        .string()
        .min(1, "Enter the date of birth")
        .refine(
          (v) => !Number.isNaN(new Date(v).getTime()),
          "Enter a valid date"
        )
        .refine((v) => {
          const age = ageOn(v)
          return age >= MIN_AGE && age <= MAX_AGE
        }, `Driver must be between ${MIN_AGE} and ${MAX_AGE} years old at registration`),
      yard: z.string().min(1, "Enter the yard"),

      vehicleType: z.enum(VEHICLE_TYPES, {
        message: "Select the vehicle type",
      }),
      yearsExperience: z
        .number({ message: "Enter years of experience" })
        .min(
          MIN_EXPERIENCE_YEARS,
          `At least ${MIN_EXPERIENCE_YEARS} years of experience on the assigned vehicle type is required`
        )
        .max(50, "Enter a realistic number of years"),

      education: z.enum(EDUCATION_LEVELS, {
        message: "Select the education level",
      }),

      smoker: z.boolean(),
      drugUser: z.boolean(),

      licenseNumber: z.string().min(3, "Enter the licence number"),
      licenseClass: z.enum(VEHICLE_TYPES, {
        message: "Select the licence category",
      }),
      licenseExpiry: z
        .string()
        .min(1, "Enter the licence expiry date")
        .refine((v) => new Date(v) > new Date(), "Licence has expired"),
      licenseCopy:
        mode === "edit" ? licenseCopyFile.optional() : licenseCopyFile,

      ...healthShape,

      drugAlcoholTest: z.enum(TEST_STATUSES),
      skillsTest: z.enum(TEST_STATUSES),
      practicalTest: z.enum(TEST_STATUSES),

      driverConfirmed: z
        .boolean()
        .refine((v) => v, "Confirm the driver has verified the information"),
      signedQuestionnaire: z
        .instanceof(File)
        .refine((f) => f.size <= MAX_FILE_SIZE, "File must be 5MB or smaller")
        .refine(
          (f) => ACCEPTED_FILES.includes(f.type),
          "Upload a JPG, PNG or PDF"
        )
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.licenseClass &&
        data.vehicleType &&
        data.licenseClass !== data.vehicleType
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["licenseClass"],
          message: "Licence must be valid for the vehicle to be driven",
        })
      }
      for (const q of HEALTH_QUESTIONS) {
        const answer = (data as Record<string, unknown>)[q.name]
        const details = (data as Record<string, unknown>)[
          `${q.name}Details`
        ] as string | undefined
        if (answer === "yes" && !details?.trim()) {
          ctx.addIssue({
            code: "custom",
            path: [`${q.name}Details`],
            message: "Please give details",
          })
        }
      }
    })
}

export const driverSchema = buildDriverSchema("create")

export type DriverFormValues = Omit<
  z.infer<typeof driverSchema>,
  "licenseCopy"
> & {
  /** Required when registering; optional when editing. */
  licenseCopy?: File
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
    required: ["fullName", "phone", "nationalId", "dateOfBirth", "yard"],
  },
  {
    id: "experience",
    title: "Experience",
    icon: GraduationCap,
    required: ["vehicleType", "yearsExperience", "education"],
  },
  {
    id: "licence",
    title: "Driving licence",
    icon: IdCard,
    required: ["licenseNumber", "licenseClass", "licenseExpiry", "licenseCopy"],
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

const isFilled = (v: unknown) =>
  v !== undefined && v !== null && v !== "" && v !== false

function requiredFields(section: SectionDef, mode: DriverFormMode) {
  return mode === "edit"
    ? section.required.filter((f) => f !== "licenseCopy")
    : section.required
}

function sectionState(
  section: SectionDef,
  values: Values,
  errors: FieldErrors<DriverFormValues>,
  mode: DriverFormMode
): "done" | "error" | "todo" {
  const errorKeys = Object.keys(errors)
  const required = requiredFields(section, mode)
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
}: BaseProps & { options: readonly string[]; placeholder: string }) {
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
                <SelectItem key={o} value={o}>
                  {o}
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

const VEHICLE_ICONS: Record<(typeof VEHICLE_TYPES)[number], IconType> = {
  Motorcycle: Bike,
  Car: Car,
  "Pickup / Van": Van,
  Minibus: BusFront,
  Truck: Truck,
  Bus: Bus,
}

function VehicleTypeField({ control }: { control: C }) {
  return (
    <Controller
      control={control}
      name="vehicleType"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel id="vehicleType-label">
            Vehicle type being assigned
          </FieldLabel>
          <div
            role="radiogroup"
            aria-labelledby="vehicleType-label"
            className="grid grid-cols-3 gap-2 sm:grid-cols-6 xl:grid-cols-3 2xl:grid-cols-6"
          >
            {VEHICLE_TYPES.map((type) => {
              const Icon = VEHICLE_ICONS[type]
              const selected = field.value === type
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    field.onChange(type)
                    field.onBlur()
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border bg-card px-2 py-3 text-xs font-medium text-muted-foreground transition-all outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50",
                    selected &&
                      "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                    fieldState.invalid && !selected && "border-destructive/50"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-center leading-tight">{type}</span>
                </button>
              )
            })}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

const TEST_TONES: Partial<Record<(typeof TEST_STATUSES)[number], string>> = {
  Passed:
    "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-emerald-950",
  Failed: "bg-destructive text-white shadow-xs",
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
            value={field.value as (typeof TEST_STATUSES)[number]}
            options={TEST_STATUSES.map((s) => ({ value: s, label: s }))}
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
      let best: string | null = null
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

function AgeBadge({ dob }: { dob: string | undefined }) {
  if (!dob || Number.isNaN(new Date(dob).getTime())) return null
  const age = ageOn(dob)
  const ok = age >= MIN_AGE && age <= MAX_AGE
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

type DriverRegistrationFormProps = {
  /** "edit" prefills from `initialValues` and relaxes the licence upload. */
  mode?: DriverFormMode
  initialValues?: Partial<DriverFormValues>
  onSubmit?: (values: DriverFormValues) => void | Promise<void>
  onCancel?: () => void
  /** For mutations that don't return a promise (e.g. `mutate`). */
  isSubmitting?: boolean
}

export function DriverRegistrationForm({
  mode = "create",
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting: isSubmittingProp = false,
}: DriverRegistrationFormProps) {
  const isEdit = mode === "edit"
  const schema = React.useMemo(() => buildDriverSchema(mode), [mode])
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<DriverFormValues>,
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      yard: "Seeta-Mukono",
      yearsExperience: undefined,
      smoker: false,
      drugUser: false,
      licenseNumber: "",
      licenseExpiry: "",
      drugAlcoholTest: "Pending",
      skillsTest: "Pending",
      practicalTest: "Pending",
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
    SECTIONS.map((s) => [s.id, sectionState(s, values, errors, mode)])
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
    .filter((v) => v !== "Pending").length

  const vehicleType = values.vehicleType as string | undefined
  const licenseClass = values.licenseClass as string | undefined
  const licenceMatches =
    !!vehicleType && !!licenseClass && vehicleType === licenseClass

  const handleSubmit = async (data: DriverFormValues) => {
    // Save the record. Attach the signed questionnaire copy
    // once the selection process is complete.
    await onSubmit?.(data)
  }

  const handleInvalid = (errs: FieldErrors<DriverFormValues>) => {
    // Bring the first section with a problem into view.
    const keys = Object.keys(errs)
    const first = SECTIONS.find((s) =>
      [
        ...requiredFields(s, mode),
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
            description={`Drivers must be ${MIN_AGE}–${MAX_AGE} years old at registration.`}
          >
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
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
                  <AgeBadge dob={values.dateOfBirth as string | undefined} />
                </span>
              </div>
              <TextField control={control} name="yard" label="Yard" />
            </div>
          </FormSection>

          <FormSection
            id="experience"
            description="The vehicle the driver will be assigned, and their background."
          >
            <div className="space-y-5">
              <VehicleTypeField control={control} />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  control={control}
                  name="yearsExperience"
                  label="Experience on this vehicle type"
                  suffix="years"
                  description={`Minimum ${MIN_EXPERIENCE_YEARS} years.`}
                />
                <SelectField
                  control={control}
                  name="education"
                  label="Highest education level"
                  description="O'Level with a driving course is preferred."
                  options={EDUCATION_LEVELS}
                  placeholder="Select level"
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            id="licence"
            description="Must be valid for the vehicle to be driven."
            aside={
              vehicleType &&
              licenseClass && (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                    licenceMatches
                      ? "text-foreground"
                      : "border-destructive/40 text-destructive"
                  )}
                >
                  {licenceMatches ? (
                    <CircleCheck className="size-3.5" />
                  ) : (
                    <CircleAlert className="size-3.5" />
                  )}
                  {licenceMatches ? "Matches vehicle" : "Doesn't match vehicle"}
                </span>
              )
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                control={control}
                name="licenseNumber"
                label="Licence number"
                className="[&_input]:font-mono [&_input]:uppercase"
              />
              <SelectField
                control={control}
                name="licenseClass"
                label="Licence category"
                options={VEHICLE_TYPES}
                placeholder="Select category"
              />
              <TextField
                control={control}
                name="licenseExpiry"
                label="Expiry date"
                type="date"
              />
              <FileField
                control={control}
                name="licenseCopy"
                label="Licence photocopy"
                description={
                  isEdit
                    ? "Upload only to replace the copy on file."
                    : "Kept in the driver's portfolio."
                }
              />
            </div>
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
