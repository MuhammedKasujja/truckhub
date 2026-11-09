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
import {
  Building2,
  CalendarRange,
  ListChecks,
  Mail,
  Phone,
  Plus,
  Route as RouteIcon,
  Ruler,
  Truck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ClientPickerField,
  ClientContactsList,
} from "@/features/clients/components"
import { useSearch } from "@tanstack/react-router"
import { TaxRatePicker } from "@/features/settings/tax-rates/components"
import { Client } from "@/features/clients/types"
import { clientProfileQueryOptions } from "@/features/clients/query-options"
import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { UserPickerField } from "@/features/users/components"
import {
  CreateQuotationRequest,
  createQuotationSchema,
  editQuotationFormSchema,
  DistanceLineItemRequest,
  LineItemRequest,
  ServiceLineItemRequest,
  RouteLineItemRequest,
} from "../../schemas"
import { RoutePricingSelectDialog } from "./route-pricing-select-dialog"
import { ServicesDialog } from "./services-dialog"
import { TaxRate } from "@/features/settings/tax-rates/types"
import { formatMoney, generateAvatorFallback } from "@/lib/format"
import { DistancePricingSelectDialog } from "./distance-pricing-select-dialog"
import Decimal from "@/lib/decimal-config"
import { LineItemRow } from "../details/line-item-row"
import { ActionIcon } from "@/components/icons"
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
  const [selectedClient, setSelectedClient] = useState<Client | null>()
  const isEdit = !!initialData

  const search = useSearch({
    from: isEdit
      ? "/_admin/quotations/$quotationId/edit"
      : "/_admin/quotations/new/",
  })
  const form = useForm<CreateQuotationRequest>({
    resolver: zodResolver(
      isEdit ? editQuotationFormSchema : createQuotationSchema
    ),
    defaultValues: initialData ?? {
      client_id: search.clientId,
      contacts: [],
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

  const selectedContactIds = form.watch("contacts")

  // A client picked from the list may not include contacts, so load the profile
  const clientProfile = useQuery({
    ...clientProfileQueryOptions(selectedClient?.id ?? ""),
    enabled: !!selectedClient,
  })
  const clientContacts =
    clientProfile.data?.data?.contacts ?? selectedClient?.contacts ?? []
  const isClientProfileLoading = !!selectedClient && clientProfile.isPending

  // Runs once per selected client, so a profile refetch can't undo a user's
  // selection. It can't live in handleClientSelected: form.reset() clears it.
  const defaultedClientId = useRef<EntityId | null>(null)
  useEffect(() => {
    const clientId = selectedClient?.id
    if (!clientId) {
      defaultedClientId.current = null
      return
    }
    if (isClientProfileLoading || defaultedClientId.current === clientId) return
    defaultedClientId.current = clientId
    // Editing the saved client keeps the contacts saved on the quotation. The
    // picker also fires onChange when it preloads that client.
    if (clientId === initialData?.client_id) return
    setValue(
      "contacts",
      clientContacts.filter((c) => c.is_primary).map((c) => c.id),
      { shouldDirty: true }
    )
  }, [selectedClient?.id, isClientProfileLoading])

  function handleClientSelected(client?: Client | null) {
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
        : taxRates,
      { shouldDirty: true }
    )
  }, [defaultTaxRate])

  const { subtotal, taxAmount, grandTotal } = useMemo(() => {
    const subtotal = lineItems.reduce(
      (acc, item) => acc.plus(item.line_total ?? 0),
      new Decimal(0)
    )
    const rate = taxRates.length
      ? taxRates.reduce((acc, t) => acc.plus(t.rate), new Decimal(0))
      : new Decimal(defaultTaxRate?.rate ?? 0)
    const taxAmount = subtotal.times(rate.div(100))
    return {
      subtotal: subtotal.toString(),
      taxAmount: taxAmount.toString(),
      grandTotal: subtotal.plus(taxAmount).toString(),
    }
  }, [taxRates, lineItems, defaultTaxRate])

  function handleSourceChange(
    source: ModalType | null,
    item?: LineItemRequest
  ) {
    setSelectedLineItem(item)
    setOpenModal(source)
  }

  function handleUpdateLineItems(lineItem: LineItemRequest) {
    const index = lineItem.tempId
      ? lineItems.findIndex((i) => i.tempId === lineItem.tempId)
      : -1

    if (index > -1) {
      lineItemsFields.update(index, lineItem)
    } else {
      lineItemsFields.prepend({ ...lineItem, tempId: crypto.randomUUID() })
    }
  }

  const canAddItems = !!selectedClient
  const addItemButtons = (Object.keys(ITEM_SOURCES) as ModalType[]).map(
    (source) => ({ source, ...ITEM_SOURCES[source] })
  )

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error(errors)
        })}
        className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
        id="form-quotation"
      >
        <div className="min-w-0 space-y-5">
          {/* Client */}
          <FormCard
            icon={Building2}
            title="Client"
            description="Who the quotation is for and who receives it"
            action={
              selectedClient &&
              !isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleClientSelected()}
                >
                  <ActionIcon action="edit" />
                  Change
                </Button>
              )
            }
          >
            {!selectedClient && (
              <ClientPickerField
                control={form.control}
                name="client_id"
                onChange={handleClientSelected}
              />
            )}
            {selectedClient && (
              <div className="flex items-center gap-3.5 rounded-xl bg-muted/50 p-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background uppercase">
                  {generateAvatorFallback(selectedClient.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {selectedClient.name}
                    {selectedClient.short_name && (
                      <span className="ml-2 rounded-md border bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {selectedClient.short_name}
                      </span>
                    )}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                    {selectedClient.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {selectedClient.phone}
                      </span>
                    )}
                    {selectedClient.email && (
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{selectedClient.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {clientContacts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Send to · {selectedContactIds.length} of{" "}
                  {clientContacts.length}
                </p>
                <div className="grid gap-2 md:grid-cols-2 [&>[data-slot=item]]:rounded-lg [&>[data-slot=item]]:border [&>[data-slot=item]]:bg-card">
                  <ClientContactsList
                    contacts={clientContacts}
                    selectedIds={selectedContactIds}
                    onSelected={(contactIds) =>
                      setValue("contacts", contactIds, { shouldDirty: true })
                    }
                  />
                </div>
              </div>
            )}
          </FormCard>

          {/* Line items */}
          <FormCard
            icon={ListChecks}
            title="Line items"
            description={
              canAddItems
                ? `${lineItems.length} ${lineItems.length === 1 ? "item" : "items"} on this quote`
                : "Select a client first to add items"
            }
            action={
              lineItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {addItemButtons.map(({ source, short, icon: Icon }) => (
                    <Button
                      key={source}
                      disabled={!canAddItems}
                      type="button"
                      variant={"outline"}
                      size="sm"
                      onClick={() => handleSourceChange(source)}
                    >
                      <Icon />
                      {short}
                    </Button>
                  ))}
                </div>
              )
            }
          >
            {lineItems.length === 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {addItemButtons.map(({ source, label, hint, icon: Icon }) => (
                  <button
                    key={source}
                    type="button"
                    disabled={!canAddItems}
                    onClick={() => handleSourceChange(source)}
                    className={cn(
                      "group flex flex-col items-start gap-3 rounded-xl border border-dashed p-4 text-left transition-all",
                      "enabled:hover:border-solid enabled:hover:border-primary/40 enabled:hover:bg-primary/5 enabled:hover:shadow-sm",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-enabled:group-hover:bg-primary group-enabled:group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Plus className="size-3.5" />
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-y bg-muted/40 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                      <th className="py-2 pr-3 pl-5 font-medium">#</th>
                      <th className="py-2 pr-4 font-medium">Item</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Unit price
                      </th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="py-2 pl-3 text-right font-medium">
                        Line total
                      </th>
                      <th className="py-2 pr-5">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_td:first-child]:pl-5 [&_td:last-child]:pr-5">
                    {lineItemsFields.fields.map((item, index) => (
                      <LineItemRow
                        item={item}
                        idx={index}
                        key={item.tempId}
                        actions={
                          <div className="flex justify-end gap-0.5">
                            <Button
                              type="button"
                              size={"icon-sm"}
                              variant={"ghost"}
                              aria-label="Edit item"
                              onClick={() =>
                                handleSourceChange(item.source, item)
                              }
                            >
                              <ActionIcon action="edit" />
                            </Button>
                            <Button
                              type="button"
                              size={"icon-sm"}
                              variant={"ghost"}
                              aria-label="Remove item"
                              className="hover:text-destructive"
                              onClick={() => lineItemsFields.remove(index)}
                            >
                              <ActionIcon action="delete" />
                            </Button>
                          </div>
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FormCard>
        </div>

        <div className="space-y-5 lg:sticky lg:top-4">
          {/* Summary */}
          <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h3 className="text-sm font-semibold">Summary</h3>
              <span className="text-xs text-muted-foreground">
                {lineItems.length} {lineItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <dl className="space-y-2.5 px-5 py-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Tax
                  {taxRate && (
                    <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {taxRate.name} {taxRate.rate}%
                    </span>
                  )}
                </dt>
                <dd className="tabular-nums">{formatMoney(taxAmount)}</dd>
              </div>
            </dl>
            <div className="border-t bg-muted/40 px-5 py-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Grand total
              </p>
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {formatMoney(grandTotal)}
              </p>
            </div>
          </section>

          {/* Details */}
          <FormCard icon={CalendarRange} title="Details">
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-2 gap-3">
                <DatePickerField
                  label={"Start date"}
                  name={"start_date"}
                  control={control}
                />
                <DatePickerField
                  label={"End date"}
                  name={"end_date"}
                  control={control}
                />
              </div>
              <UserPickerField
                label={"Assigned user"}
                name={"assigned_user_id"}
                control={control}
                required={false}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  required={false}
                  readOnly
                  label={"Quotation no."}
                  placeholder="Auto"
                  name={"number"}
                  control={control}
                />
                <DiscountField
                  label={"Discount"}
                  name={"discount"}
                  control={control}
                  required={false}
                />
              </div>
              <TextareaField
                label={"Purpose"}
                name={"purpose"}
                control={control}
                required={isEdit}
              />
            </FieldGroup>
          </FormCard>
        </div>
      </form>
      <RoutePricingSelectDialog
        clientId={selectedClient?.id ?? ""}
        open={openModal === "route"}
        lineItem={selectedLineItem as RouteLineItemRequest}
        selectedPricings={[]}
        onOpenChange={() => handleSourceChange(null)}
        onLineItemAdded={handleUpdateLineItems}
      />
      <ServicesDialog
        clientId={selectedClient?.id ?? ""}
        open={openModal === "service"}
        lineItem={selectedLineItem as ServiceLineItemRequest}
        onOpenChange={() => handleSourceChange(null)}
        onLineItemAdded={handleUpdateLineItems}
      />
      <DistancePricingSelectDialog
        clientId={selectedClient?.id ?? ""}
        lineItem={selectedLineItem as DistanceLineItemRequest}
        open={openModal === "distance"}
        onOpenChange={() => handleSourceChange(null)}
        onLineItemAdded={handleUpdateLineItems}
      />
    </>
  )
}

const ITEM_SOURCES: Record<
  ModalType,
  {
    label: string
    short: string
    hint: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  service: {
    label: "Vehicle hire",
    short: "Vehicle",
    hint: "Hire a car or truck at its listed fare",
    icon: Truck,
  },
  route: {
    label: "Route haulage",
    short: "Route",
    hint: "Price a known route by tonnage",
    icon: RouteIcon,
  },
  distance: {
    label: "Distance haulage",
    short: "Distance",
    hint: "Price any trip by km and load",
    icon: Ruler,
  },
}

/** A titled card section of the quotation form. */
function FormCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4.5" />
          </span>
          <div>
            <h2 className="leading-tight font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
