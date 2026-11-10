import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeftRight, Clock, Gauge, Ruler } from "lucide-react"
import { IconRouteSquare } from "@tabler/icons-react"
import { RouteCreateSchema, RouteUpdateSchema } from "../schemas"
import { createRouteFn, updateRouteFn } from "../services"
import { formatDaysHint, formatHoursRange } from "./route-format"
import type z from "zod"
import type { BookingRoute } from "../schemas"
import { Button } from "@/components/ui/button"
import { NumberField, TextField } from "@/components/ui/form-fields"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatNumber } from "@/lib/format"

type RouteEditFormProps = {
  initialData?: BookingRoute
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormValues = z.infer<typeof RouteCreateSchema> & { id?: BookingRoute["id"] }

const emptyValues = { origin: "", destination: "" } as FormValues

export function RouteEditForm({
  open,
  onOpenChange,
  initialData,
}: RouteEditFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? RouteUpdateSchema : RouteCreateSchema),
    defaultValues: initialData ?? emptyValues,
  })

  function handleOpenChange(next: boolean) {
    // Start from the saved values every time the dialog opens.
    if (next) form.reset(initialData ?? emptyValues)
    onOpenChange(next)
  }

  function swapEnds() {
    const { origin, destination } = form.getValues()
    form.setValue("origin", destination, { shouldDirty: true })
    form.setValue("destination", origin, { shouldDirty: true })
  }

  async function onSubmit(values: FormValues) {
    const { isSuccess, error, message } =
      values.id !== undefined
        ? await updateRouteFn({ data: { ...values, id: values.id } })
        : await createRouteFn({ data: values })

    if (isSuccess) {
      toast.success(message ?? (isEdit ? "Route updated" : "Route added"))
      queryInvalidator.settings.routes.list()
      onOpenChange(false)
    } else {
      toast.error(error?.message ?? "Couldn't save the route")
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      icon={IconRouteSquare}
      eyebrow={isEdit ? "Edit route" : "New route"}
      title={
        isEdit
          ? `${initialData.origin} → ${initialData.destination}`
          : "Add a booking route"
      }
      description="Routes are offered when booking trucks and pricing trips."
      submitText={isEdit ? "Save changes" : "Add route"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormGroup title="Route" description="Where the trip starts and ends">
        <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <TextField
            label="Origin"
            control={form.control}
            name="origin"
            placeholder="e.g. Kampala"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={swapEnds}
            aria-label="Swap origin and destination"
            title="Swap origin and destination"
            className="justify-self-center sm:mt-[1.625rem]"
          >
            <ArrowLeftRight />
          </Button>
          <TextField
            label="Destination"
            control={form.control}
            name="destination"
            placeholder="e.g. Mombasa"
          />
        </div>
      </FormGroup>

      <FormGroup
        title="Distance & delivery time"
        description="Used to estimate when a shipment arrives"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField
            label="Distance (km)"
            control={form.control}
            name="distance_km"
            placeholder="0"
          />
          <NumberField
            label="Min hours"
            control={form.control}
            name="min_hrs"
            placeholder="0"
          />
          <NumberField
            label="Max hours"
            control={form.control}
            name="max_hrs"
            placeholder="0"
          />
        </div>
      </FormGroup>

      <RoutePreview control={form.control} />
    </SettingsFormDialog>
  )
}

/** Live summary of the route being entered, with the speed it implies. */
function RoutePreview({
  control,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"]
}) {
  const [origin, destination, distance, min, max] = useWatch({
    control,
    name: ["origin", "destination", "distance_km", "min_hrs", "max_hrs"],
  })

  const hasDistance = isPositive(distance)
  const hasWindow = isNonNegative(min) && isPositive(max) && max > min
  // Slowest average uses the longest time, fastest uses the shortest.
  const slowest = hasDistance && hasWindow ? distance / max : undefined
  const fastest =
    hasDistance && hasWindow && min > 0 ? distance / min : undefined

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <span className="truncate">{origin.trim() || "Origin"}</span>
        <span className="text-muted-foreground">→</span>
        <span className="truncate">{destination.trim() || "Destination"}</span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <PreviewStat icon={Ruler} label="Distance">
          {hasDistance ? `${formatNumber(distance)} km` : "–"}
        </PreviewStat>
        <PreviewStat icon={Clock} label="Delivery">
          {hasWindow ? formatHoursRange(min, max) : "–"}
          {hasWindow && formatDaysHint(min, max) && (
            <span className="block text-xs font-normal text-muted-foreground">
              {formatDaysHint(min, max)}
            </span>
          )}
        </PreviewStat>
        <PreviewStat icon={Gauge} label="Avg speed">
          {slowest === undefined
            ? "–"
            : fastest === undefined
              ? `≥ ${formatSpeed(slowest)}`
              : `${formatSpeed(slowest)}–${formatSpeed(fastest)}`}
        </PreviewStat>
      </dl>
    </div>
  )
}

function PreviewStat({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums">
        {children}
      </dd>
    </div>
  )
}

const isPositive = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0
const isNonNegative = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0

const formatSpeed = (kmh: number) => `${Math.round(kmh)} km/h`
