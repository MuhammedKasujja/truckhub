import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import {
  NumberField,
  DiscountField,
  DateTimePickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import z from "zod"
import {
  TonnagePricingRequest,
  TruckBookingRequest,
  TruckBookingSchema,
} from "@/features/bookings/schemas"
import { toast } from "sonner"
import { Control, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { createTruckBookingFn } from "@/features/bookings/services"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { ClientPicker } from "@/features/clients/components/client-picker"
import { ClientContactsList } from "@/features/clients/components/client-contacts-list"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import { useTruckBookingForm } from "../hooks/use-truck-booking-form"
import { TaxRatePicker } from "@/features/settings/tax-rates/components"
import { Client } from "@/features/clients/types"
import { useState } from "react"
import { TaxRate } from "@/features/settings/tax-rates/types"
import { RoutePricingSelectDialog } from "./route-pricing-select-dialog"

type TrucksBookingFormProps = {
  initialData?: TruckBookingRequest
}

export function TrucksBookingForm({ initialData }: TrucksBookingFormProps) {
  const tr = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const [taxRate, setTaxRate] = useState<TaxRate>()
  const search = useSearch({ from: "/_admin/bookings/new/" })
  const queryInvalidator = useQueryInvalidator()
  const {
    control,
    grandTotal,
    selectedClient,
    locations,
    handleSelectClient,
    setContacts,
    handleSubmit,
    formState,
    handleUpdatePricings,
    removePricingRow,
  } = useTruckBookingForm(search.clientId, initialData)

  async function onSubmit(values: z.infer<typeof TruckBookingSchema>) {
    const { isSuccess, error } = await createTruckBookingFn({ data: values })
    if (isSuccess) {
      toast.success(`${tr("bookings.booking_created_successfully")}`)
      queryInvalidator.bookings.list.invalidate()
    } else {
      toast.error(error!.message)
    }
  }

  function handleClientSelected(client: Client | null) {
    // navigate({
    //   to: "/bookings/new",
    //   search: (prev) => ({
    //     ...prev,
    //     clientId: client?.id,
    //   }),
    //   replace: true,
    // })
    handleSelectClient(client)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log(errors)
      })}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          {selectedClient && <CardTitle>{selectedClient.name}</CardTitle>}
          {selectedClient && (
            <CardDescription>{selectedClient.phone}</CardDescription>
          )}
          <CardAction>
            <SubmitButton
              text={tr("common.form.submit")}
              isSubmitting={formState.isSubmitting}
              disabled={locations.length === 0}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ClientPicker
            value={selectedClient}
            onSelected={handleClientSelected}
          />
          {selectedClient && (
            <ClientContactsList
              contacts={selectedClient?.contacts}
              onSelected={setContacts}
            />
          )}
          <TaxRatePicker
            value={taxRate}
            onSelected={(taxRate) => {
              setTaxRate(taxRate)
            }}
          />
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
            Grand Total {formatMoney(grandTotal, { showZeroAsNumber: true })}
          </CardTitle>
          <CardDescription>Locations {locations.length}</CardDescription>
          <CardAction>
            <Button
              type="button"
              disabled={!selectedClient}
              onClick={() => setOpen(true)}
            >
              <Plus />
              Locations
            </Button>
            <RoutePricingSelectDialog
              open={open}
              onOpenChange={setOpen}
              clientId={selectedClient?.id ?? ""}
              onSelectedPricings={handleUpdatePricings}
            />
          </CardAction>
        </CardHeader>
      </Card>
      <Separator />
      {locations.length > 0 ? (
        locations.map((route, index) => (
          <div
            key={route.route_id}
            className="rounded-md border border-dashed p-4"
          >
            <div>{route.destination}</div>
            <div className="py-2">
              {route.min_hrs} HRS - {route.max_hrs} HRS {route.distance_km} KM
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 text-xs">
                <div>Min Tons</div>
                <div>Max Tons</div>
                <div>Cost Price</div>
                <div>Price</div>
                <div>Tonnage</div>
              </div>
              {route.pricings.map((pricing, pricingIndex) => (
                <TonnagePricingRow
                  key={pricing.id}
                  routeIndex={index}
                  control={control}
                  pricingIndex={pricingIndex}
                  pricing={pricing}
                  handleRemove={removePricingRow}
                />
              ))}
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
  pricingIndex: number
  pricing: TonnagePricingRequest
  handleRemove: (routeIndex: number, pricingIndex: number) => void
}

function TonnagePricingRow({
  control,
  routeIndex,
  pricingIndex,
  handleRemove,
  pricing,
}: Props) {
  return (
    <div
      className="flex flex-row gap-4"
      key={`${routeIndex}_${pricingIndex}_pricing`}
    >
      <Input defaultValue={pricing.min_tons} readOnly disabled />
      <Input defaultValue={pricing.max_tons} readOnly disabled />
      <Input
        defaultValue={formatMoney(pricing.default_price)}
        readOnly
        disabled
      />
      <Controller
        name={`services.${routeIndex}.pricings.${pricingIndex}.price`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              {...field}
              type={"number"}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              onChange={(e) => {
                const number = e.target.valueAsNumber
                field.onChange(isNaN(number) ? null : number)
              }}
            />
            {fieldState.invalid && (
              <FieldError className="text-xs" errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name={`services.${routeIndex}.pricings.${pricingIndex}.tons`}
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
            {fieldState.invalid && (
              <FieldError className="text-xs" errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Button
        type="button"
        variant="destructive"
        size={"icon-sm"}
        onClick={() => handleRemove(routeIndex, pricingIndex)}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
