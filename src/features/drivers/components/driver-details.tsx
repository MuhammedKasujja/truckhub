import React from "react"
import { Link } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  IdCard,
  Info,
  Link2Off,
  MapPin,
  PencilIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { driverQueryKeys } from "../queries"
import { getMockDriverRegistration } from "../driver-registration-mock"
import {
  HEALTH_QUESTIONS,
  VEHICLE_ICONS,
  ageOn,
} from "./driver-registration-form"
import { VEHICLE_TYPES, labelFor } from "./driver-options"
import { DEFAULT_DRIVER_POLICY } from "./driver-policy"
import type { DriverDocument, DriverRegistrationRecord } from "../driver-registration-mock"
import type { TestStatus, VehicleType } from "./driver-options"
import type { DriverPolicy } from "./driver-policy"
import type { Driver } from "../types"
import type { Vehicle } from "@/features/vehicles/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { Skeleton } from "@/components/ui/skeleton"
import { VehiclePicker } from "@/features/vehicles/components"
import {
  vehicleAssignDriverFn,
  vehicleUnAssignDriverFn,
} from "@/features/vehicles/services"
import { formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

type DriverDetailsProps = {
  driver: Driver
  /**
   * What registration captured. Defaults to sample data until the driver
   * API returns it (see driver-registration-mock.ts).
   */
  registration?: DriverRegistrationRecord
  policy?: DriverPolicy
}

const TEST_LABELS = {
  drugAlcoholTest: "Drug and alcohol test",
  skillsTest: "Driving skills test",
  practicalTest: "Practical driving test",
} as const

/** Health condition code as the payload stores it, e.g. "serious_illness". */
const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

const daysUntil = (date: string) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
}

/** Overall selection outcome from the three tests. */
function selectionStatus(r: DriverRegistrationRecord) {
  const results = [r.drugAlcoholTest, r.skillsTest, r.practicalTest]
  if (results.includes("failed")) return "failed" as const
  if (results.every((t) => t === "passed")) return "cleared" as const
  return "in_selection" as const
}

export function DriverDetails({
  driver,
  registration,
  policy = DEFAULT_DRIVER_POLICY,
}: DriverDetailsProps) {
  const isSample = !registration
  const record = registration ?? getMockDriverRegistration(driver)

  const age = ageOn(record.dateOfBirth)
  const ageOk = age >= policy.minAge && age <= policy.maxAge
  const licenceDays = daysUntil(record.licenseExpiry)
  const tests = [record.drugAlcoholTest, record.skillsTest, record.practicalTest]
  const passed = tests.filter((t) => t === "passed").length
  const status = selectionStatus(record)
  const assigned = record.vehicleTypes.map((v) => v.vehicleType)
  const uncovered = assigned.filter((t) => !record.licenseClasses.includes(t))
  const maxYears = Math.max(...record.vehicleTypes.map((v) => v.yearsExperience), 0)

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/drivers"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All drivers
        </Link>

        <section className="flex flex-wrap items-center gap-5 rounded-xl border bg-card p-5 shadow-xs">
          {driver.photo_url ? (
            <img
              src={driver.photo_url}
              alt={record.fullName}
              className="size-20 shrink-0 rounded-full object-cover ring-4 ring-background"
            />
          ) : (
            <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {initials(record.fullName)}
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {record.fullName}
              </h1>
              <SelectionBadge status={status} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {driver.number && (
                <span className="font-mono text-xs leading-5 font-medium text-foreground">
                  {driver.number}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {record.yardName}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                Registered {formatDate(record.registeredAt)}
              </span>
            </div>
          </div>
          <Can permission="drivers:edit">
            <Button asChild>
              <Link to="/drivers/$driverId/edit" params={{ driverId: driver.id }}>
                <PencilIcon />
                Edit
              </Link>
            </Button>
          </Can>
        </section>

        {isSample && (
          <p className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            Name, phone, email and licence number are real. The other
            registration details are sample data until the driver API returns
            them.
          </p>
        )}
      </div>

      {/* Key facts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={UserRound}
          label="Age"
          value={`${age} years`}
          note={
            ageOk
              ? `Within ${policy.minAge}–${policy.maxAge}`
              : `Outside ${policy.minAge}–${policy.maxAge}`
          }
          tone={ageOk ? "default" : "bad"}
        />
        <StatTile
          icon={Car}
          label="Vehicle types"
          value={String(record.vehicleTypes.length)}
          note={`Up to ${maxYears} years' experience`}
        />
        <StatTile
          icon={IdCard}
          label="Licence"
          value={licenceDays < 0 ? "Expired" : `${licenceDays} days`}
          note={
            licenceDays < 0
              ? `Expired ${formatDate(record.licenseExpiry)}`
              : `Valid until ${formatDate(record.licenseExpiry)}`
          }
          tone={licenceDays < 0 ? "bad" : licenceDays <= 60 ? "warn" : "default"}
        />
        <StatTile
          icon={FlaskConical}
          label="Selection tests"
          value={`${passed} / ${tests.length}`}
          note={
            status === "cleared"
              ? "All passed"
              : status === "failed"
                ? "A test was failed"
                : `${tests.length - passed} still to pass`
          }
          tone={status === "failed" ? "bad" : "default"}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Vehicles & experience */}
          <Section
            icon={GraduationCap}
            title="Vehicles & experience"
            description={`Vehicle types the driver can be assigned · minimum ${policy.minExperienceYears} years on each`}
          >
            <ul className="divide-y">
              {record.vehicleTypes.map(({ vehicleType, yearsExperience }) => {
                const Icon = VEHICLE_ICONS[vehicleType]
                const covered = record.licenseClasses.includes(vehicleType)
                return (
                  <li key={vehicleType} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium">
                          {labelFor("vehicleType", vehicleType)}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {yearsExperience}{" "}
                          <span className="font-normal text-muted-foreground">
                            {yearsExperience === 1 ? "year" : "years"}
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(yearsExperience / Math.max(maxYears, 1), 1) * 100}%` }}
                        />
                      </div>
                      <p
                        className={cn(
                          "flex items-center gap-1 text-xs text-muted-foreground",
                          !covered && "text-destructive"
                        )}
                      >
                        {covered ? (
                          <CircleCheck className="size-3" />
                        ) : (
                          <CircleAlert className="size-3" />
                        )}
                        {covered ? "Covered by licence" : "Not covered by licence"}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Section>

          {/* Licence */}
          <Section
            icon={IdCard}
            title="Driving licence"
            description="The categories the licence covers"
            aside={
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                  uncovered.length > 0 && "border-destructive/40 text-destructive"
                )}
              >
                {uncovered.length === 0 ? (
                  <CircleCheck className="size-3.5" />
                ) : (
                  <CircleAlert className="size-3.5" />
                )}
                {uncovered.length === 0
                  ? "Covers all vehicle types"
                  : `Missing ${uncovered.map((t) => labelFor("vehicleType", t)).join(", ")}`}
              </span>
            }
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Fact label="Licence number">
                  <span className="font-mono">{record.licenseNumber}</span>
                </Fact>
                <Fact label="Expires">
                  <span className={cn(licenceDays < 0 && "text-destructive")}>
                    {formatDate(record.licenseExpiry)}
                  </span>
                </Fact>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VEHICLE_TYPES.map((type) => (
                  <LicenceClassTile
                    key={type}
                    type={type}
                    held={record.licenseClasses.includes(type)}
                    needed={assigned.includes(type)}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* Health */}
          <HealthSection record={record} />

          {/* Tests */}
          <Section
            icon={FlaskConical}
            title="Selection tests"
            description="Results recorded during selection"
          >
            <ul className="divide-y">
              {(Object.keys(TEST_LABELS) as (keyof typeof TEST_LABELS)[]).map((key) => (
                <li key={key} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-sm">{TEST_LABELS[key]}</span>
                  <TestStatusPill status={record[key]} />
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Section icon={UserRound} title="Driver information">
            <dl className="divide-y text-sm">
              <InfoRow label="Full name" value={record.fullName} />
              <InfoRow label="National ID" value={<span className="font-mono text-xs">{record.nationalId}</span>} />
              <InfoRow
                label="Date of birth"
                value={`${formatDate(record.dateOfBirth)} (${age} years)`}
              />
              <InfoRow
                label="Phone"
                value={<a href={`tel:${record.phone}`} className="hover:underline">{record.phone}</a>}
              />
              <InfoRow
                label="Email"
                value={
                  record.email ? (
                    <a href={`mailto:${record.email}`} className="hover:underline">{record.email}</a>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )
                }
              />
              <InfoRow label="Yard" value={record.yardName} />
              <InfoRow label="Education" value={labelFor("education", record.education)} />
              <InfoRow label="Smokes" value={record.isSmoker ? "Yes" : "No"} />
              <InfoRow label="Uses drugs" value={record.isDrugUser ? "Yes" : "No"} />
            </dl>
          </Section>

          <CurrentVehicleSection driver={driver} />

          <Section icon={FileText} title="Documents">
            <ul className="space-y-2">
              <DocumentRow label="Licence photocopy" doc={record.licenseCopy} />
              <DocumentRow label="Signed questionnaire" doc={record.signedQuestionnaire} />
            </ul>
          </Section>

          <Section icon={FileCheck2} title="Registration">
            <dl className="divide-y text-sm">
              <InfoRow
                label="Driver confirmed"
                value={
                  record.driverConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-success-foreground">
                      <CircleCheck className="size-3.5" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not yet</span>
                  )
                }
              />
              <InfoRow label="Registered by" value={record.registeredBy} />
              <InfoRow label="Registered on" value={formatDateTime(record.registeredAt)} />
            </dl>
          </Section>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function HealthSection({ record }: { record: DriverRegistrationRecord }) {
  const answers = HEALTH_QUESTIONS.map((q) => ({
    ...q,
    ...(record.health[toSnake(q.name)] ?? { answer: false, details: null }),
  }))
  const disclosed = answers.filter((a) => a.answer)
  return (
    <Section
      icon={HeartPulse}
      title="Health screening"
      description="Answers the driver gave at registration"
      aside={
        <span className="text-sm font-semibold tabular-nums">
          {disclosed.length}{" "}
          <span className="font-normal text-muted-foreground">
            of {answers.length} disclosed
          </span>
        </span>
      }
    >
      <ul className="divide-y">
        {answers.map((a) => (
          <li key={a.name} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1 space-y-1">
              <p className={cn("text-sm", !a.answer && "text-muted-foreground")}>
                {a.label}
              </p>
              {a.answer && a.details && (
                <p className="rounded-md border-l-2 border-warning bg-muted/40 px-3 py-1.5 text-sm">
                  {a.details}
                </p>
              )}
            </div>
            <span
              className={cn(
                "h-fit shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
                a.answer ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {a.answer ? "Yes" : "No"}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function CurrentVehicleSection({ driver }: { driver: Driver }) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = React.useState<Vehicle | null>()
  const [busy, setBusy] = React.useState(false)
  const vehicle = driver.vehicle

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: driverQueryKeys.detail(driver.id) })

  async function assign() {
    if (!selected) return toast.error("Select a vehicle first")
    setBusy(true)
    const { isSuccess, error, message } = await vehicleAssignDriverFn({
      data: { driverId: driver.id, vehicleId: selected.id },
    })
    setBusy(false)
    if (!isSuccess) return toast.error(error?.message)
    toast.success(message)
    setSelected(null)
    refresh()
  }

  async function unassign() {
    if (!vehicle) return
    setBusy(true)
    const { isSuccess, error, message } = await vehicleUnAssignDriverFn({
      data: { id: vehicle.id },
    })
    setBusy(false)
    if (!isSuccess) return toast.error(error?.message)
    toast.success(message)
    refresh()
  }

  return (
    <Section icon={Car} title="Current vehicle">
      {vehicle ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Car className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {vehicle.display_name || vehicle.number}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {vehicle.plate_number}
              </p>
            </div>
            <Badge variant="secondary">Assigned</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Fact label="Vehicle no.">{vehicle.number}</Fact>
            <Fact label="Year">{vehicle.year}</Fact>
            <Fact label="Gearbox">{vehicle.gearbox}</Fact>
            <Fact label="Fuel">
              {vehicle.fuel_consumption_rate ? `${vehicle.fuel_consumption_rate} km/l` : "Not set"}
            </Fact>
          </div>
          <Can permission="vehicles:unassign">
            <Button variant="outline" size="sm" className="w-full" disabled={busy} onClick={unassign}>
              <Link2Off />
              Unassign vehicle
            </Button>
          </Can>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No vehicle assigned. Pick one the driver's licence covers.
          </p>
          <VehiclePicker value={selected} onChange={(v) => setSelected(v)} />
          <Button size="sm" className="w-full" disabled={!selected || busy} onClick={assign}>
            Assign vehicle
          </Button>
        </div>
      )}
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Section({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon: IconType
  title: string
  description?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm leading-8 font-semibold">{title}</h2>
            {description && (
              <p className="-mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  note,
  tone = "default",
}: {
  icon: IconType
  label: string
  value: string
  note: string
  tone?: "default" | "warn" | "bad"
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tracking-tight tabular-nums">{value}</p>
        <p
          className={cn(
            "truncate text-xs text-muted-foreground",
            tone === "warn" && "text-warning-foreground",
            tone === "bad" && "text-destructive"
          )}
        >
          {note}
        </p>
      </div>
    </div>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{children}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
    </div>
  )
}

function SelectionBadge({ status }: { status: ReturnType<typeof selectionStatus> }) {
  if (status === "cleared") {
    return (
      <Badge className="bg-success/15 text-success-foreground">
        <ShieldCheck />
        Cleared
      </Badge>
    )
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive">
        <CircleAlert />
        Failed selection
      </Badge>
    )
  }
  return (
    <Badge variant="secondary">
      <CircleDashed />
      In selection
    </Badge>
  )
}

function TestStatusPill({ status }: { status: TestStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        status === "passed" && "bg-success/15 text-success-foreground",
        status === "failed" && "bg-destructive/10 text-destructive",
        status === "pending" && "bg-muted text-muted-foreground"
      )}
    >
      {status === "passed" && <CircleCheck className="size-3" />}
      {status === "failed" && <CircleAlert className="size-3" />}
      {status === "pending" && <CircleDashed className="size-3" />}
      {labelFor("testStatus", status)}
    </span>
  )
}

function LicenceClassTile({
  type,
  held,
  needed,
}: {
  type: VehicleType
  held: boolean
  needed: boolean
}) {
  const Icon = VEHICLE_ICONS[type]
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm text-muted-foreground",
        held && "border-primary/40 bg-primary/5 text-foreground",
        needed && !held && "border-dashed border-destructive/50 text-destructive"
      )}
    >
      <Icon className={cn("size-4 shrink-0", held && "text-primary")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{labelFor("vehicleType", type)}</span>
        <span className="block text-[11px]">
          {held ? (needed ? "Held · drives this" : "Held") : needed ? "Needed" : "Not held"}
        </span>
      </span>
    </div>
  )
}

function DocumentRow({ label, doc }: { label: string; doc?: DriverDocument }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
          doc && "bg-primary/10 text-primary"
        )}
      >
        <FileText className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">
          {doc
            ? `${doc.name} · ${(doc.size / 1024 / 1024).toFixed(1)} MB · ${formatDate(doc.uploadedAt)}`
            : "Not uploaded yet"}
        </p>
      </div>
      {doc?.url && (
        <Button variant="ghost" size="sm" asChild>
          <a href={doc.url} target="_blank" rel="noreferrer">
            View
          </a>
        </Button>
      )}
    </li>
  )
}

export function DriverDetailsSkeleton() {
  return (
    <div className="flex w-full max-w-7xl flex-col gap-6" aria-busy="true" aria-label="Loading driver">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
