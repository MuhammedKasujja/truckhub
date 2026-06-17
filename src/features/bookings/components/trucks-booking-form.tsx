import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import {
  NumberField,
  DiscountField,
  DateTimePickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import { useEffect, useMemo, useState } from "react"
import z from "zod"
import {
  BookingCreateSchema,
  BookingUpdateSchemaType,
  TruckBookingSchema,
} from "@/features/bookings/schemas"
import { toast } from "sonner"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { ListIcon, Plus } from "lucide-react"
import { createBookingFn } from "@/features/bookings/services"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { ClientPicker } from "@/features/clients/components/client-picker"
import { Client } from "@/features/clients/types"
import { ClientContactsList } from "@/features/clients/components/client-contacts-list"
import { useSearch } from "@tanstack/react-router"
import { RoutePricingDialog } from "./route-pricing-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { IconCloud } from "@tabler/icons-react"
import { RoutePricing } from "@/features/settings/pricing"

type TrucksBookingFormProps = {
  initialData?: BookingUpdateSchemaType
}

export function TrucksBookingForm({ initialData }: TrucksBookingFormProps) {
  const tr = useTranslation()
  const search = useSearch({ from: "/_admin/bookings/new/" })
  const queryInvalidator = useQueryInvalidator()
  const [client, setClient] = useState<Client | null>(null)
  const [routesPricings, setRoutesPricings] = useState<RoutePricing[]>([])

  const isEdit = !!initialData

  const { control, handleSubmit, formState, watch, setValue } = useForm<
    z.infer<typeof TruckBookingSchema>
  >({
    resolver: zodResolver(TruckBookingSchema),
    defaultValues: {
      client_id: search.clientId,
      services: [],
      contacts: [],
    },
    mode: "onChange",
  })

  const { fields, remove, prepend } = useFieldArray({
    control,
    name: "services",
  })

  const { data: clientsResponse } = useQuery(clientsSearchQueryOptions())

  async function onSubmit(values: z.infer<typeof BookingCreateSchema>) {
    const { isSuccess, error } = await createBookingFn({ data: values })
    if (isSuccess) {
      toast.success(`${tr("bookings.booking_created_successfully")}`)
      queryInvalidator.bookings.list.invalidate()
    } else {
      toast.error(error!.message)
    }
  }

  const watchedServiceItems = useWatch({
    control,
    name: "services",
    defaultValue: [],
  })

  const partialAmount = watch("partial")
  const discount = watch("discount")

  const calculatedServicesTotals = useMemo(() => {
    return watchedServiceItems.map((item) => {
      const qty = item.total_items || 0
      const price = Number(item.cost_per_item) || 0
      const discount = item.discount || 0

      const subtotalBeforeDiscount = qty * price
      const discountAmount = subtotalBeforeDiscount * (discount / 100)
      const lineTotal = subtotalBeforeDiscount - discountAmount

      return {
        ...item,
        lineTotal: Math.round(lineTotal * 100) / 100, // 2 decimal places
      }
    })
  }, [watchedServiceItems])

  const grandTotal = useMemo(() => {
    return calculatedServicesTotals.reduce(
      (sum, item) => sum + (item.lineTotal || 0),
      0
    )
  }, [calculatedServicesTotals])

  useEffect(() => {
    setValue("client_id", search.clientId ?? "")
    if (clientsResponse) {
      const client = clientsResponse.data.find((c) => c.id === search.clientId)
      setClient(client ?? null)
    }
  }, [search, clientsResponse])

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
            <RoutePricingDialog
              clientId={client?.id ?? ""}
              onSelectedPricings={(pricings) => {
                setRoutesPricings(pricings)
              }}
              trigger={
                <Button type="button" disabled={!client}>
                  <Plus/>
                  Locations
                </Button>
              }
            />
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
      {routesPricings.length > 0 ? (
        routesPricings.map((route) => (
          <div key={route.route_id}>
            <div>{route.destination}</div>
            <div>{route.distance_km}</div>
            <div>
              {route.min_hrs} - {route.max_hrs}
            </div>
            <div>
              {route.pricings.length}
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
              Click Routes Button to add destinations for the client.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RoutePricingDialog
              clientId={client?.id ?? ""}
              onSelectedPricings={(pricings) => {
                setRoutesPricings(pricings)
              }}
              trigger={
                <Button type="button" disabled={!client}>
                  Routes
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      )}
    </form>
  )
}
