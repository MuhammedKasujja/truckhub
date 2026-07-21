import {
  Control,
  Controller,
  useForm,
  UseFormGetValues,
  UseFormSetValue,
  useWatch,
} from "react-hook-form"
import {
  BookingRouteRequest,
  RoutePricingStruct,
  TruckBookingRequest,
} from "../../schemas"
import { EntityId } from "@/schemas"
import { PricingsSortable } from "./PricingsSortable"
import { useBookingFormActions } from "./actions"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"
import { RoutePricingSelectDialog } from "../route-pricing-select-dialog"
import { GripVertical, PackageOpen, Route } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoney } from "@/lib/format"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"

export function BookingForm({ clientId }: { clientId?: EntityId }) {
  const form = useForm<TruckBookingRequest>({
    defaultValues: {
      client_id: clientId,
      services: [],
    },
  })

  const { control, getValues, setValue } = form

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Booking</h2>
        <p className="text-sm text-muted-foreground">
          Configure services and routes for this booking.
        </p>
      </div>

      <ServicesList
        control={control}
        getValues={getValues}
        setValue={setValue}
      />
    </div>
  )
}

type Props = {
  control: Control<TruckBookingRequest>
  getValues: UseFormGetValues<TruckBookingRequest>
  setValue: UseFormSetValue<TruckBookingRequest>
}

export function ServicesList({ control, getValues, setValue }: Props) {
  const services = useWatch({ control, name: "services" })

  if (!services?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        <PackageOpen className="h-8 w-8" />
        <p className="text-sm">No services added to this booking yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <ServiceRow
          key={service.tempId}
          serviceIndex={index}
          service={service}
          getValues={getValues}
          setValue={setValue}
          control={control}
        />
      ))}
    </div>
  )
}

type ServiceRowProps = {
  service: BookingRouteRequest
  serviceIndex: number
  control: Control<TruckBookingRequest>
  getValues: UseFormGetValues<TruckBookingRequest>
  setValue: UseFormSetValue<TruckBookingRequest>
}

function ServiceRow({
  service,
  getValues,
  setValue,
  serviceIndex,
  control,
}: ServiceRowProps) {
  const { reorderRoutes, syncRoutes, upsertRoutePricing } = useBookingFormActions(
    getValues,
    setValue
  )
  const [open, setOpen] = useState(false)

  const services = useWatch({ control, name: "services" })
  const routes =
    services?.find((s) => s.tempId === service.tempId)?.routes ?? []

  //   const routes =
  //     useWatch({
  //       control,
  //       name: `services.${serviceIndex}.routes`,
  //     }) ?? []
  const routeTotalCost = useMemo(
    () =>
      routes.reduce(
        (curr, route) =>
          curr + Number(route.pricing.price ?? route.pricing.default_price),
        0
      ),
    [routes]
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">
                {routes.length > 0 ? (
                  <>
                    {routes.at(0)?.destination}
                    <span className="mx-1.5 text-muted-foreground">→</span>
                    {routes.at(-1)?.destination}
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    No routes selected
                  </span>
                )}
              </CardTitle>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  {routes.length} {routes.length === 1 ? "route" : "routes"}
                </Badge>
                <span className="text-sm font-medium">
                  {formatMoney(routeTotalCost)}
                </span>
              </div>
            </div>
          </div>

          <CardAction className="flex items-center gap-4">
            <Controller
              name={`services.${serviceIndex}.is_round_trip`}
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation={"horizontal"}
                  className="gap-2"
                >
                  <FieldLabel htmlFor={field.name} className="text-sm">
                    Round Trip
                  </FieldLabel>
                  <Checkbox
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    checked={field.value}
                    onCheckedChange={(state: boolean) => field.onChange(state)}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      className="text-xs"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <div>
              <Button
                className="flex"
                type="button"
                onClick={() => setOpen(true)}
                variant={"outline"}
              >
                Add Routes
              </Button>
              <RoutePricingSelectDialog
                open={open}
                onOpenChange={setOpen}
                clientId={getValues("client_id")}
                selectedPricings={routes}
                onSelectedPricings={(routes) => {
                  syncRoutes({ serviceId: service.tempId, routes })
                }}
                onLiveChange={(route) => {
                  setValue(
                    "services",
                    upsertRoutePricing(services, service.tempId, route),
                    { shouldDirty: true }
                  )
                }}
              />
            </div>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center text-muted-foreground">
            <PackageOpen className="h-6 w-6" />
            <p className="text-sm">
              Click &ldquo;Add Routes&rdquo; to build this service.
            </p>
          </div>
        ) : (
          <Sortable
            value={routes}
            getItemValue={(item) => item.route_id}
            onValueChange={(newOrder) =>
              reorderRoutes({
                serviceId: service.tempId,
                routes: newOrder,
              })
            }
          >
            <SortableContent className="flex flex-col gap-2">
              {routes.map((route) => (
                <SortableItem
                  key={route.route_id}
                  value={route.route_id}
                  className="rounded-lg border bg-card shadow-sm"
                >
                  <div className="flex items-center gap-2 p-2">
                    <SortableItemHandle asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="size-8 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </SortableItemHandle>
                    <div className="flex-1">
                      <PricingsSortable
                        control={control}
                        serviceId={service.tempId}
                        routeId={route.route_id}
                        route={route}
                        getValues={getValues}
                        setValue={setValue}
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContent>
          </Sortable>
        )}
      </CardContent>
    </Card>
  )
}

type RouteRowProps = {
  serviceId: EntityId
  route: RoutePricingStruct
  control: Control<TruckBookingRequest>
  getValues: UseFormGetValues<TruckBookingRequest>
  setValue: UseFormSetValue<TruckBookingRequest>
}

export function RouteRow({
  serviceId,
  route,
  getValues,
  setValue,
  control,
}: RouteRowProps) {
  return (
    <div className="rounded-lg border bg-card p-2 shadow-sm">
      <PricingsSortable
        control={control}
        serviceId={serviceId}
        routeId={route.route_id}
        route={route}
        getValues={getValues}
        setValue={setValue}
      />
    </div>
  )
}