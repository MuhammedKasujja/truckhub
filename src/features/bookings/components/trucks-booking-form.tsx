import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  NumberField,
  DiscountField,
  DateTimePickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import { useEffect, useMemo, useState } from "react"
import z from "zod"
import {
  RoutePricingStruct,
  TruckBookingRequest,
  TruckBookingSchema,
} from "@/features/bookings/schemas"
import { toast } from "sonner"
import { Control, Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { createTruckBookingFn } from "@/features/bookings/services"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQuery } from "@tanstack/react-query"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { ClientPicker } from "@/features/clients/components/client-picker"
import { Client } from "@/features/clients/types"
import { ClientContactsList } from "@/features/clients/components/client-contacts-list"
import { useSearch } from "@tanstack/react-router"
import { RoutePricingDialog } from "./route-pricing-dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/format"
import { Separator } from "@/components/ui/separator"

type TrucksBookingFormProps = {
  initialData?: TruckBookingRequest
}

export function TrucksBookingForm({ initialData }: TrucksBookingFormProps) {
  const tr = useTranslation()
  const search = useSearch({ from: "/_admin/bookings/new/" })
  const queryInvalidator = useQueryInvalidator()
  const [client, setClient] = useState<Client | null>(null)
  const [routesPricings, setRoutesPricings] = useState<RoutePricingStruct[]>([])

  const { control, handleSubmit, formState, watch, setValue } = useForm<
    z.infer<typeof TruckBookingSchema>
  >({
    resolver: zodResolver(TruckBookingSchema),
    defaultValues: {
      client_id: search.clientId,
      contacts: [],
      locations: [],
    },
    mode: "onChange",
  })

  const { fields, remove, prepend, replace } = useFieldArray({
    control,
    name: "locations",
  })

  const { data: clientsResponse } = useQuery(clientsSearchQueryOptions())

  async function onSubmit(values: z.infer<typeof TruckBookingSchema>) {
    const { isSuccess, error } = await createTruckBookingFn({ data: values })
    if (isSuccess) {
      toast.success(`${tr("bookings.booking_created_successfully")}`)
      queryInvalidator.bookings.list.invalidate()
    } else {
      toast.error(error!.message)
    }
  }

  const partialAmount = watch("partial")
  const discount = watch("discount")

  const grandTotal = useMemo(() => {
    const total = routesPricings.reduce(
      (sum, route) =>
        sum +
        route.pricings.reduce(
          (sum, pricing) => sum + (Number(pricing.price) || 0),
          0
        ),
      0
    )
    return total
  }, [routesPricings])

  useEffect(() => {
    setValue("client_id", search.clientId ?? "")
    if (clientsResponse) {
      const client = clientsResponse.data.find((c) => c.id === search.clientId)
      setClient(client ?? null)
    }
  }, [search, clientsResponse])

  useEffect(() => {
    replace(routesPricings)
  }, [routesPricings])

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log(errors)
      })}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          {client && <CardTitle>{client.name}</CardTitle>}
          {client && <CardDescription>{client.phone}</CardDescription>}
          <CardAction>
            <SubmitButton
              text={tr("common.form.submit")}
              isSubmitting={formState.isSubmitting}
              disabled={fields.length === 0}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ClientPicker
            onSelect={(client) => {
              setValue("client_id", client?.id ?? "")
              setClient(client)
              setRoutesPricings([])
            }}
            clients={clientsResponse?.data ?? []}
          />
          {client && (
            <ClientContactsList
              contacts={client?.contacts}
              onSelected={(contacts) => {
                setValue("contacts", contacts)
              }}
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <FieldGroup className="grid grid-flow-col md:grid-cols-4">
            <DateTimePickerField
              label={"Pickup Date"}
              name={"pickup_time"}
              control={control}
            />
            <DateTimePickerField
              label={"Return Date"}
              name={"return_time"}
              control={control}
            />
            <NumberField
              label={"Initial Payment"}
              name={"partial"}
              control={control}
              required={false}
            />
            <DiscountField
              label={"Discount"}
              name={"discount"}
              control={control}
              required={false}
            />
          </FieldGroup>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Grand Total {formatPrice(grandTotal, { showZeroAsNumber: true })}
          </CardTitle>
          <CardDescription>Locations {routesPricings.length}</CardDescription>
          <CardAction>
            <RoutePricingDialog
              clientId={client?.id ?? ""}
              onSelectedPricings={(pricings) => {
                setRoutesPricings(pricings)
              }}
              trigger={
                <Button type="button" disabled={!client}>
                  <Plus />
                  Locations
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
      </Card>
      <Separator />
      {fields.length > 0 ? (
        fields.map((route, index) => (
          <div
            key={route.route_id}
            className="rounded-md border border-dashed p-4"
          >
            <div>{route.destination}</div>
            <div className="py-2">
              {route.min_hrs} HRS - {route.max_hrs} HRS {route.distance_km} KM
            </div>
            <div className="space-y-4">
              <TonnagePricingRow
                key={route.route_id}
                routeIndex={index}
                control={control}
              />
            </div>
          </div>
        ))
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plus />
            </EmptyMedia>
            <EmptyTitle>Destination List Empty</EmptyTitle>
            <EmptyDescription>
              Click Locations to add destinations for the client.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </form>
  )
}

type Props = {
  control: Control<TruckBookingRequest>
  routeIndex: number
}

function TonnagePricingRow({ control, routeIndex }: Props) {
  const { fields: pricings, remove } = useFieldArray({
    control,
    name: `locations.${routeIndex}.pricings`,
  })

  return (
    <>
      {pricings.map((pricing, pricingIndex) => (
        <div
          className="flex flex-row gap-4"
          key={`${routeIndex}_${pricingIndex}_pricing`}
        >
          <Input defaultValue={pricing.min_tons} readOnly disabled />
          <Input defaultValue={pricing.max_tons} readOnly disabled />
          <Input
            defaultValue={formatPrice(pricing.default_price)}
            readOnly
            disabled
          />
          <Controller
            name={`locations.${routeIndex}.pricings.${pricingIndex}.price`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  type={"text"}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Controller
            name={`locations.${routeIndex}.pricings.${pricingIndex}.tons`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  type={"text"}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
              </Field>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size={"icon-sm"}
            onClick={() => remove(pricingIndex)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
    </>
  )
}
