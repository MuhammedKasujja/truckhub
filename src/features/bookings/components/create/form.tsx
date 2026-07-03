import {
  Control,
  Controller,
  useFieldArray,
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
import { GripVertical } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { formatPrice } from "@/lib/format"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

export function BookingForm({ clientId }: { clientId?: EntityId }) {
  const form = useForm<TruckBookingRequest>({
    defaultValues: {
      client_id: clientId,
      services: [],
    },
  })

  const { control, getValues, setValue } = form

  return (
    <div>
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
  const serviceFields = useFieldArray({
    control,
    name: "services",
  })

  const services = useWatch({ control, name: "services" })

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
  const { reorderRoutes, syncRoutes } = useBookingFormActions(
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
          curr +
          Number(route.pricings[0].price ?? route.pricings[0].default_price),
        0
      ),
    [routes]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {routes.at(0)?.destination} - {routes.at(-1)?.destination}{" "}
          {formatPrice(routeTotalCost)}
        </CardTitle>
        <CardAction>
          <Controller
            name={`services.${serviceIndex}.is_round_trip`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} orientation={'horizontal'}>
                <FieldLabel htmlFor={field.name}>Round Trip</FieldLabel>
                <Checkbox
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  checked={field.value}
                  onCheckedChange={(state: boolean) => field.onChange(state)}
                />
                {fieldState.invalid && (
                  <FieldError className="text-xs" errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
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
          <SortableContent>
            {routes.map((route) => (
              <SortableItem key={route.route_id} value={route.route_id}>
                <div className="flex items-center gap-2">
                  <SortableItemHandle asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="size-8"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </SortableItemHandle>
                  <PricingsSortable
                    control={control}
                    serviceId={service.tempId}
                    routeId={route.route_id}
                    route={route}
                    getValues={getValues}
                    setValue={setValue}
                  />
                </div>
              </SortableItem>
            ))}
          </SortableContent>
        </Sortable>
      </CardContent>
      <CardFooter>
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
        />
      </CardFooter>
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
    <div>
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
