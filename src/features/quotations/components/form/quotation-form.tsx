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
import { EditIcon, MapPin, Plus, Trash2Icon } from "lucide-react"
import {
  ClientPickerField,
  ClientContactsList,
} from "@/features/clients/components"
import { useSearch } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"
import { TaxRatePicker } from "@/features/settings/tax-rates/components"
import { Client } from "@/features/clients/types"
import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { UserPickerField } from "@/features/users/components"
import { CreateQuotationRequest, createQuotationSchema } from "../../schemas"
import { RoutePricingSelectDialog } from "./route-pricing-select-dialog"
import { ServicesDialog } from "./services-dialog"
import { TaxRate } from "@/features/settings/tax-rates/types"
import { formatMoney } from "@/lib/format"
import { DistancePricingSelectDialog } from "./distance-pricing-select-dialog"
// import { QrCode, QrCodeFrame } from "@/components/ui/qr-code"

type QuotationFormProps = {
  initialData?: Partial<CreateQuotationRequest>
  onSubmit: (data: CreateQuotationRequest) => void
}

export function QuotationForm({ initialData, onSubmit }: QuotationFormProps) {
  const tr = useTranslation()
  const [openModal, setOpenModal] = useState<
    "service" | "route" | "distance" | null
  >(null)
  const defaultTaxRate = useDefaultTaxRate()

  const [taxRate, setTaxRate] = useState(defaultTaxRate)
  const [selectedClient, setSelectedClient] = useState<Client>()
  const isEdit = !!initialData

  const search = useSearch({
    from: isEdit
      ? "/_admin/quotations/$quotationId/edit"
      : "/_admin/quotations/new/",
  })
  const form = useForm<CreateQuotationRequest>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: initialData ?? {
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

  const lineItems = form.watch("line_items")

  const taxRates = form.watch("tax_rates")

  function handleClientSelected(client?: Client) {
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

  function handleUpdateTaxRates(taxRate?: TaxRate | null) {
    setTaxRate(taxRate)
    form.setValue(
      "tax_rates",
      taxRate
        ? [
            {
              tax_name: taxRate.name,
              rate: Number(taxRate.rate),
              id: taxRate.id,
            },
          ]
        : []
    )
  }

  const subtotal = useMemo(
    () => lineItems.reduce((curr, item) => curr + Number(item.line_total), 0),
    [lineItems]
  )

  const grandTotal = useMemo(() => {
    let total = subtotal
    if (taxRates.length > 0) {
      const rates = taxRates.reduce((curr, tax) => curr + tax.rate, 0)
      total += total * (rates / 100)
    }
    return total
  }, [subtotal, taxRates])

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
            {!selectedClient && (
              <ClientPickerField
                required
                // label="Client"
                placeholder="Select client"
                control={form.control}
                name="client_id"
                onSelected={handleClientSelected}
              />
            )}
            {selectedClient && (
              <ClientContactsList
                contacts={selectedClient?.contacts}
                // onSelected={setContacts}
              />
            )}
            {selectedClient && (
              <CardHeader className="gap-2 p-0">
                <CardTitle className="text-lg">
                  {selectedClient.name} - {selectedClient.short_name}
                </CardTitle>
                <CardDescription className="space-y-3">
                  <div>{selectedClient.phone}</div>
                  <div>{selectedClient.email}</div>
                </CardDescription>
                <CardAction onClick={() => handleClientSelected()}>
                  <EditIcon />
                </CardAction>
              </CardHeader>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <FieldGroup className="grid grid-flow-row gap-4">
              <DatePickerField
                label={"Start Date"}
                name={"start_date"}
                control={control}
              />
              <DatePickerField
                label={"End Date"}
                name={"end_date"}
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
              <CardTitle className="text-base">Services</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="font-normal">
                  {lineItemsFields.fields.length}{" "}
                  {lineItemsFields.fields.length === 1 ? "service" : "services"}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <CardAction className="flex gap-4">
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => setOpenModal("service")}
            >
              <Plus />
              Cars
            </Button>
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => setOpenModal("route")}
            >
              <Plus />
              Routes
            </Button>
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => setOpenModal("distance")}
            >
              <Plus />
              Distance
            </Button>
            <RoutePricingSelectDialog
              clientId={selectedClient?.id ?? ""}
              open={openModal === "route"}
              selectedPricings={[]}
              onOpenChange={() => setOpenModal(null)}
              onLineItemAdded={(lineItem) => lineItemsFields.prepend(lineItem)}
            />
            <ServicesDialog
              clientId={selectedClient?.id ?? ""}
              open={openModal === "service"}
              onOpenChange={() => setOpenModal(null)}
              onLineItemAdded={(lineItem) => lineItemsFields.prepend(lineItem)}
            />
            <DistancePricingSelectDialog
              clientId={selectedClient?.id ?? ""}
              open={openModal === "distance"}
              onOpenChange={() => setOpenModal(null)}
              onLineItemAdded={(lineItem) => lineItemsFields.prepend(lineItem)}
            />
          </CardAction>
        </CardHeader>
      </Card>

      <Separator />
      {/* <QrCode value="813db729-e67d-4b9a-86ac-85373edead63" className="[--qr-code-size:8rem]">
        <QrCodeFrame className="rounded-md border" />
      </QrCode> */}

      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardContent>
            {lineItemsFields.fields.map((item, index) => (
              <div key={item.tempId} className="flex gap-4 space-y-2">
                <div className="text-muted-foreground">
                  {item.is_round_trip && <>Round</>}
                </div>
                <div>{item.quantity}</div>
                <div>{formatMoney(item.unit_price)}</div>
                <div>{formatMoney(item.line_total)}</div>
                <div>{formatMoney(item.discount)}</div>
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
            <div className="flex justify-between">
              <div className="text-muted-foreground">Subtotal</div>
              <div className="font-semibold">
                {formatMoney(subtotal, { showZeroAsNumber: true })}
              </div>
            </div>
            <TaxRatePicker
              id="tax"
              value={taxRate}
              onSelected={handleUpdateTaxRates}
            />
            <div className="flex justify-between">
              <div className="text-muted-foreground">Grand total</div>
              <div className="font-semibold">
                {formatMoney(grandTotal, { showZeroAsNumber: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
