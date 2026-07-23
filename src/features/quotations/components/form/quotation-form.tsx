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
  TextField,
  TextareaField,
  DatePickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Trash2Icon } from "lucide-react"
import {
  ClientPickerField,
  ClientContactsList,
} from "@/features/clients/components"
import { useSearch } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"
import { TaxRatePicker } from "@/features/settings/tax-rates/components"
import { Client } from "@/features/clients/types"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { makeId } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"
import { Badge } from "@/components/ui/badge"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { UserPickerField } from "@/features/users/components"
import {
  CreateQuotationRequest,
  createQuotationSchema,
  LineItemRequest,
} from "../../schemas"
import { RoutePricingSelectDialog } from "./route-pricing-select-dialog"
import { ServicesDialog } from "./services-dialog"

type QuotationFormProps = {
  initialData?: CreateQuotationRequest
  onSubmit: (data: CreateQuotationRequest) => void
}

function generateEmptyLineItem(itemType: "truck" | "small") {
  const emptyLineItem: LineItemRequest = {
    tempId: makeId("__line_item__"),
    unit_price: 0,
    subtotal: 0,
    line_total: 0,
    services: [],
    vehicle_addons: [],
    item_type: itemType,
    quantity: 0,
    discount: 0,
    car_brand_id: "",
    car_model_id: "",
    with_loaders: false,
    with_driver: false,
    estimated_consumption_rate_km: 0,
    engine_mode: "wet",
    tonnage: 0,
  }
  return emptyLineItem
}

export function QuotationForm({ initialData, onSubmit }: QuotationFormProps) {
  const tr = useTranslation()
  const [open, setOpen] = useState(false)
  const [openService, setServiceOpen] = useState(false)
  const defaultTaxRate = useDefaultTaxRate()

  const [taxRate, setTaxRate] = useState(defaultTaxRate)
  const [selectedClient, setSelectedClient] = useState<Client>()
  const search = useSearch({ from: "/_admin/quotations/new/" })
  const form = useForm<CreateQuotationRequest>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      client_id: search.clientId,
      line_items: [],
      tax_rates: [],
    },
  })

  const { control, getValues, setValue } = form

  const lineItemsFields = useFieldArray({
    control,
    name: "line_items",
  })

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
        console.log(errors.line_items)
      })}
      className="space-y-4"
      id="form-quotation"
    >
      <div className="grid grid-flow-row gap-5 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-4">
            <ClientPickerField
              required
              // label="Client"
              placeholder="Select client"
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
            <CardHeader className="gap-2 p-0">
              {selectedClient && (
                <CardTitle className="text-lg">
                  {selectedClient.name} - {selectedClient.short_name}
                </CardTitle>
              )}
              {selectedClient && (
                <CardDescription className="space-y-3">
                  <div>{selectedClient.phone}</div>
                  <div>{selectedClient.email}</div>
                </CardDescription>
              )}
            </CardHeader>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <FieldGroup className="grid grid-flow-row gap-4">
              <DatePickerField
                label={"Expiry Date"}
                name={"expiry_date"}
                control={control}
              />
              <NumberField
                label={"Partial Amount"}
                name={"partial"}
                control={control}
                required={false}
              />
              <UserPickerField
                label={"Assigned User"}
                name={"assigned_user_id"}
                control={control}
                required={false}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <FieldGroup className="grid grid-flow-row gap-4">
              <TextField
                required={false}
                readOnly
                label={"Quotation No."}
                name={"number"}
                control={control}
              />
              <DiscountField
                label={"Discount"}
                name={"discount"}
                control={control}
                required={false}
              />
              <TextareaField
                label={"Purpose"}
                name={"purpose"}
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
                  {lineItemsFields.fields.length}{" "}
                  {lineItemsFields.fields.length === 1
                    ? "location"
                    : "locations"}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <CardAction className="flex gap-4">
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => {
                setServiceOpen(true)
              }}
            >
              <Plus />
              Cars
            </Button>
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => {
                lineItemsFields.prepend(generateEmptyLineItem("truck"))
                setOpen(true)
              }}
            >
              <Plus />
              Trucks
            </Button>
            <RoutePricingSelectDialog
              clientId={selectedClient?.id ?? ""}
              open={open}
              selectedPricings={[]}
              onOpenChange={setOpen}
              onSelectedPricings={(pricings) => {}}
            />
            <ServicesDialog
              clientId={selectedClient?.id ?? ""}
              open={openService}
              onOpenChange={setServiceOpen}
              onLineItemAdded={(lineItem) => lineItemsFields.prepend(lineItem)}
            />
          </CardAction>
        </CardHeader>
      </Card>

      <Separator />
      {/* <QrCode value="c59167b3-07b7-491b-aac0-2443c3504ac1" className="[--qr-code-size:8rem]">
        <QrCodeFrame className="rounded-md border" />
      </QrCode> */}

      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardContent>
            {lineItemsFields.fields.map((item, index) => (
              <div key={item.tempId} className="flex gap-4 space-y-2">
                <div>{item.subtotal}</div>
                <div>{item.quantity}</div>
                <div>{item.unit_price}</div>
                <Button
                  size={"sm"}
                  variant={"destructive"}
                  type="button"
                  onClick={() => lineItemsFields.remove(index)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="space-y-4">
            <TaxRatePicker
              id="tax"
              value={taxRate}
              onSelected={(taxRate) => {
                setTaxRate(taxRate)
              }}
            />
            <TaxRatePicker
              id="tax"
              value={taxRate}
              onSelected={(taxRate) => {
                setTaxRate(taxRate)
              }}
            />
            <TaxRatePicker
              id="tax"
              value={taxRate}
              onSelected={(taxRate) => {
                setTaxRate(taxRate)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
