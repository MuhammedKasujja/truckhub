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
  DiscountField,
  TextField,
  TextareaField,
  DatePickerField,
  MoneyField,
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
import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { UserPickerField } from "@/features/users/components"
import {
  CreateQuotationRequest,
  createQuotationSchema,
  DistanceLineItemRequest,
  LineItemRequest,
  SmallLineItemRequest,
  TruckLineItemRequest,
} from "../../schemas"
import { RoutePricingSelectDialog } from "./route-pricing-select-dialog"
import { ServicesDialog } from "./services-dialog"
import { TaxRate } from "@/features/settings/tax-rates/types"
import { formatMoney } from "@/lib/format"
import { DistancePricingSelectDialog } from "./distance-pricing-select-dialog"
import Decimal from "@/lib/decimal-config"
import { LineItemRow } from "../details/line-item-row"
// import { QrCode, QrCodeFrame } from "@/components/ui/qr-code"

type QuotationFormProps = {
  initialData?: Partial<CreateQuotationRequest>
  onSubmit: (data: CreateQuotationRequest) => void
}

type ModalType = "service" | "route" | "distance"

export function QuotationForm({ initialData, onSubmit }: QuotationFormProps) {
  const tr = useTranslation()
  const [openModal, setOpenModal] = useState<ModalType | null>(null)
  const [selectedLineItem, setSelectedLineItem] = useState<LineItemRequest>()

  const defaultTaxRate = useDefaultTaxRate()

  const [taxRate, setTaxRate] = useState(defaultTaxRate)
  const [subtotal, setSubtotal] = useState<string>()
  const [taxAmount, setTaxAmount] = useState<string>()
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

  const { control, setValue } = form

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
              rate: taxRate.rate,
              id: taxRate.id,
            },
          ]
        : []
    )
  }

  useEffect(() => {
    setTaxRate(defaultTaxRate)
    form.setValue(
      "tax_rates",
      defaultTaxRate
        ? [
            ...taxRates,
            {
              id: defaultTaxRate.id,
              tax_name: defaultTaxRate.name,
              rate: defaultTaxRate.rate,
            },
          ]
        : taxRates
    )
  }, [defaultTaxRate])

  const grandTotal = useMemo(() => {
    const subtotal = lineItems.reduce(
      (curr, item) => curr.plus(item.line_total ?? 0),
      new Decimal(0)
    )
    let total = subtotal
    setSubtotal(subtotal.toString())
    if (taxRates.length > 0) {
      const rates = taxRates.reduce(
        (curr, tax) => curr.plus(tax.rate),
        new Decimal(0)
      )
      const taxAmount = total.times(rates.div(100))
      total = total.plus(taxAmount)
      setTaxAmount(taxAmount.toString())
    }
    return total.toString()
  }, [taxRates, lineItems])

  function handleSourceChange(source: ModalType | null, item?: LineItemRequest) {
    setOpenModal(source)
    setSelectedLineItem(item)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error(errors)
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
              <MoneyField
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
              onClick={() => handleSourceChange("service")}
            >
              <Plus />
              Cars
            </Button>
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => handleSourceChange("route")}
            >
              <Plus />
              Routes
            </Button>
            <Button
              disabled={!selectedClient}
              type="button"
              variant={"outline"}
              onClick={() => handleSourceChange("distance")}
            >
              <Plus />
              Distance
            </Button>
            <RoutePricingSelectDialog
              clientId={selectedClient?.id ?? ""}
              open={openModal === "route"}
              lineItem={selectedLineItem as TruckLineItemRequest}
              selectedPricings={[]}
              onOpenChange={() => handleSourceChange(null)}
              onLineItemAdded={(lineItem) => lineItemsFields.prepend(lineItem)}
            />
            <ServicesDialog
              clientId={selectedClient?.id ?? ""}
              open={openModal === "service"}
              lineItem={selectedLineItem as SmallLineItemRequest}
              onOpenChange={() => handleSourceChange(null)}
              onLineItemAdded={(lineItem) => lineItemsFields.prepend(lineItem)}
            />
            <DistancePricingSelectDialog
              clientId={selectedClient?.id ?? ""}
              lineItem={selectedLineItem as DistanceLineItemRequest}
              open={openModal === "distance"}
              onOpenChange={() => handleSourceChange(null)}
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
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
              Line items — {lineItems.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-[10px] tracking-wide text-muted-foreground uppercase">
                  <th className="pr-3 pb-2 font-medium">#</th>
                  <th className="pr-4 pb-2 font-medium">Item</th>
                  <th className="px-3 pb-2 text-right font-medium">
                    Unit price
                  </th>
                  <th className="px-3 pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 pl-3 text-right font-medium">
                    Line total
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lineItemsFields.fields.map((item, index) => (
                  <LineItemRow
                    // onClick={()=>handleSourceChange(item.source, item)}
                    item={item}
                    idx={index}
                    key={index}
                    actions={
                      <div>
                        <Button
                          type="button"
                          size={"xs"}
                          variant={"ghost"}
                          onClick={() => handleSourceChange(item.source, item)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          type="button"
                          size={"xs"}
                          variant={"ghost"}
                          onClick={() => lineItemsFields.remove(index)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardContent>
              <TaxRatePicker
                id="tax"
                value={taxRate?.id}
                onSelected={handleUpdateTaxRates}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div className="text-muted-foreground">Subtotal</div>
                <div className="font-semibold">
                  {formatMoney(subtotal, { showZeroAsNumber: true })}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground">
                  Tax ({taxRate?.name} {taxRate?.rate}%)
                </div>
                <div className="font-semibold">
                  {formatMoney(taxAmount, { showZeroAsNumber: true })}
                </div>
              </div>
              <div className="flex justify-between border-b-2 pb-1.5">
                <div className="text-muted-foreground">Grand total</div>
                <div className="font-bold">
                  {formatMoney(grandTotal, { showZeroAsNumber: true })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
