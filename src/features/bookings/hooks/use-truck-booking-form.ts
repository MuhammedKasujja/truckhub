import z from "zod"
import { toast } from "sonner"
import { EntityId } from "@/schemas"
import { useTranslation } from "@/i18n"
import { useQuery } from "@tanstack/react-query"
import { Client } from "@/features/clients/types"
import { createTruckBookingFn } from "../services"
import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useFieldArray, useForm, useWatch, Form } from "react-hook-form"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import {
  RoutePricingStruct,
  TruckBookingSchema,
  TruckBookingRequest,
} from "../schemas"

export function useTruckBookingForm(
  clientId?: EntityId,
  initialData?: TruckBookingRequest
) {
  const tr = useTranslation()

  const queryInvalidator = useQueryInvalidator()
  const [client, setClient] = useState<Client | null>(null)
  const [routesPricings, setRoutesPricings] = useState<RoutePricingStruct[]>([])

  const { control, handleSubmit, formState, watch, setValue, getValues } =
    useForm<z.infer<typeof TruckBookingSchema>>({
      resolver: zodResolver(TruckBookingSchema),
      defaultValues: {
        client_id: clientId,
        contacts: [],
        services: [],
      },
      mode: "onChange",
    })

  const { replace } = useFieldArray({
    control,
    name: "services",
  })

  const { data: clients } = useQuery(clientsSearchQueryOptions())

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

  const locations = useWatch({ control, name: "services" })

  const grandTotal = useMemo(() => {
    const total = locations.reduce(
      (sum, route) =>
        sum +
        route.pricings.reduce(
          (sum, pricing) => sum + (Number(pricing.price) || 0),
          0
        ),
      0
    )
    return total
  }, [locations])

  useEffect(() => {
    setValue("client_id", clientId ?? "")
    if (clients) {
      const client = clients.find((c) => c.id === clientId)
      setClient(client ?? null)
    }
  }, [clientId, clients])

  useEffect(() => {
    replace(routesPricings)
  }, [routesPricings])

  function removePricingRow(routeIndex: number, pricingIndex: number) {
    const pricings = getValues(`services.${routeIndex}.pricings`)
    pricings.splice(pricingIndex, 1)
    // if the pricings list is empty, remove the location from the list
    if (pricings.length === 0) {
      const locations = getValues("services")
      const updated = locations.filter((_, i) => i !== routeIndex)
      replace(updated)
    } else {
      setValue(`services.${routeIndex}.pricings`, pricings)
    }
  }

  function handleSelectClient(client: Client | null) {
    setValue("client_id", client?.id ?? "")
    setClient(client)
    setRoutesPricings([])
  }

  function setContacts(contacts: EntityId[]) {
    setValue("contacts", contacts)
  }

  function handleUpdatePricings(pricings: RoutePricingStruct[]) {
    setRoutesPricings(pricings)
  }

  return {
    formState,
    grandTotal,
    onSubmit,
    control,
    selectedClient: client,
    locations,
    handleSelectClient,
    setContacts,
    handleSubmit,
    handleUpdatePricings,
    clients: clients ?? [],
    removePricingRow,
  }
}
