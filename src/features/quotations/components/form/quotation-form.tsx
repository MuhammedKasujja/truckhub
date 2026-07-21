import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  NumberField,
  DiscountField,
  DateTimePickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import z from "zod"
import {
  TruckBookingRequest,
  TruckBookingSchema,
} from "@/features/bookings/schemas"
import { toast } from "sonner"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import { createTruckBookingFn } from "@/features/bookings/services"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { ClientPickerField, ClientContactsList } from "@/features/clients/components"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"
import { TaxRatePicker } from "@/features/settings/tax-rates/components"
import { Client } from "@/features/clients/types"
import { useState } from "react"
import { RouteServicesList } from "./route-service-list"
import { zodResolver } from "@hookform/resolvers/zod"
import { makeId } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"
import { Badge } from "@/components/ui/badge"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"

type QuotationFormProps = {
  initialData?: TruckBookingRequest
}

export function QuotationForm({ initialData }: QuotationFormProps) {
  const tr = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const defaultTaxRate = useDefaultTaxRate()

  const [taxRate, setTaxRate] = useState(defaultTaxRate)
  const [selectedClient, setSelectedClient] = useState<Client>()
  const search = useSearch({ from: "/_admin/bookings/new/" })
  const queryInvalidator = useQueryInvalidator()
  const form = useForm<TruckBookingRequest>({
    resolver: zodResolver(TruckBookingSchema),
    defaultValues: {
      client_id: search.clientId,
      services: [],
    },
  })

  const { control, getValues, setValue } = form

  const serviceFields = useFieldArray({
    control,
    name: "services",
  })

  async function onSubmit(values: z.infer<typeof TruckBookingSchema>) {
    const { isSuccess, error, data } = await createTruckBookingFn({
      data: values,
    })
    if (isSuccess) {
      toast.success(`${tr("bookings.booking_created_successfully")}`)
      queryInvalidator.bookings.list.invalidate()
      if (data) {
        navigate({
          from: "/bookings/$bookingId/view",
          params: { bookingId: data.id },
        })
      }
    } else {
      toast.error(error!.message)
    }
  }

  function handleClientSelected(client: Client | undefined) {
    // navigate({
    //   to: "/quotations/new",
    //   search: (prev) => ({
    //     ...prev,
    //     clientId: client?.id,
    //   }),
    //   replace: true,
    // })
    form.reset()
    setSelectedClient(client)
    setValue("client_id", client?.id ?? "")
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log(errors.services)
      })}
      className="space-y-4"
    >
      <div className="grid grid-flow-row gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="gap-1">
            {selectedClient && (
              <CardTitle className="text-lg">{selectedClient.name}</CardTitle>
            )}
            {selectedClient && (
              <CardDescription>{selectedClient.phone}</CardDescription>
            )}
            <CardAction>
              <SubmitButton
                text={tr("common.form.submit")}
                isSubmitting={form.formState.isSubmitting}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClientPickerField
              label="Client"
              control={form.control}
              name="client_id"
              onSelected={handleClientSelected}
            />
            {selectedClient && (
              <ClientContactsList
                contacts={selectedClient?.contacts}
                // onSelected={setContacts}
              />
            )}
            <FieldLabel htmlFor="tax">Tax</FieldLabel>
            <TaxRatePicker
              id="tax"
              value={taxRate}
              onSelected={(taxRate) => {
                setTaxRate(taxRate)
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <FieldGroup className="grid grid-flow-row gap-4">
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
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Locations</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="font-normal">
                  {serviceFields.fields.length}{" "}
                  {serviceFields.fields.length === 1 ? "location" : "locations"}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() =>
                serviceFields.prepend({
                  tempId: makeId("__service__"),
                  routes: [],
                })
              }
            >
              <Plus />
              Locations
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <Separator />

      {/* {locations.length > 0 ? ( */}
      <RouteServicesList
        control={control}
        getValues={getValues}
        setValue={setValue}
      />
      {/* ) : (
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
      )} */}
    </form>
  )
}
