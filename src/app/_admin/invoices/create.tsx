import React, { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import Decimal from "decimal.js"
import {
  CalendarClock,
  FileText,
  Fuel,
  Gauge,
  Loader2,
  Mail,
  Phone,
  Receipt,
  Route as RouteIcon,
  Truck,
  Weight,
} from "lucide-react"
import { toast } from "sonner"
import type { Quotation } from "@/features/quotations/types"
import type { Shipment } from "@/features/shipments/types"
import type { EntityId } from "@/schemas"
import { PageBackButton } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { DatePicker } from "@/components/ui/form-fields"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreateInvoice } from "@/features/invoices/hooks/use-edit-invoice"
import { QuotationPicker } from "@/features/quotations/components"
import { useQuotationCompletedShipments } from "@/features/quotations/hooks/use-quotation-shipments"
import { useClientLoadingFeesWithFallback } from "@/features/settings/pricing/hooks/use-loading-offloading-pricing"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { requirePermission } from "@/lib/auth"
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  generateAvatorFallback,
} from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_admin/invoices/create")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("invoices:create"),
})

const DUE_PRESETS = [7, 14, 30] as const

const toDecimal = (value: string | number | null | undefined) => {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

const serviceDays = (shp: Shipment) => shp.consumption?.days || 1

const shipmentAmount = (shp: Shipment) =>
  toDecimal(shp.item.unit_price).times(serviceDays(shp))

const addDays = (days: number) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

function RouteComponent() {
  const [quotation, setQuotation] = useState<Quotation | null>()
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [selectedIds, setSelectedIds] = useState<EntityId[]>([])

  const { data: shipments, isLoading: isLoadingShipments } =
    useQuotationCompletedShipments(quotation?.id)
  const { data: loadingFees } = useClientLoadingFeesWithFallback({
    clientId: quotation?.client.id,
  })
  const defaultTaxRate = useDefaultTaxRate()
  const { createInvoice, isPending } = useCreateInvoice()

  useEffect(() => {
    setSelectedIds([])
  }, [quotation?.id])

  const allShipments = useMemo(() => shipments ?? [], [shipments])

  const loadingFeesFor = (shp: Shipment) => {
    if (!shp.item.with_loaders) return null
    const pricing = loadingFees?.pricings.find(
      (ele) =>
        Number(ele.tonnage_min) <= Number(shp.item.tonnage) &&
        Number(ele.tonnage_max) >= Number(shp.item.tonnage)
    )
    if (!pricing) return null
    return {
      loading: toDecimal(pricing.loading_fees),
      offloading: toDecimal(pricing.offloading_fees),
    }
  }

  const selected = useMemo(
    () => allShipments.filter((shp) => selectedIds.includes(shp.id)),
    [allShipments, selectedIds]
  )

  const totals = useMemo(() => {
    const subtotal = selected.reduce(
      (sum, shp) => sum.plus(shipmentAmount(shp)),
      new Decimal(0)
    )
    const fuel = selected.reduce(
      (sum, shp) => sum.plus(toDecimal(shp.consumption?.total_fuel_charge)),
      new Decimal(0)
    )
    const loading = selected.reduce((sum, shp) => {
      const fees = loadingFeesFor(shp)
      return fees ? sum.plus(fees.loading).plus(fees.offloading) : sum
    }, new Decimal(0))
    const tax = subtotal.times((defaultTaxRate?.rate ?? 0) / 100)
    return {
      subtotal,
      fuel,
      loading,
      tax,
      grand: subtotal.plus(fuel).plus(loading).plus(tax),
    }
  }, [selected, loadingFees, defaultTaxRate?.rate])

  const allSelected =
    allShipments.length > 0 && selected.length === allShipments.length

  function toggle(id: EntityId) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((ele) => ele !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : allShipments.map((shp) => shp.id))
  }

  function handleCreateInvoice() {
    if (!quotation) {
      toast.error("Please select a quotation")
      return
    }
    if (!dueDate) {
      toast.error("Due date is required")
      return
    }
    if (selectedIds.length < 1) {
      toast.error("Please select at least one shipment")
      return
    }

    createInvoice({
      quotationId: quotation.id,
      unitIds: selectedIds,
      dueDate: dueDate.toLocaleDateString("en-CA"),
    })
  }

  const canSubmit = !!quotation && !!dueDate && selectedIds.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="-ml-2">
              <PageBackButton />
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">New invoice</h1>
              <p className="text-sm text-muted-foreground">
                Bill a client for completed shipments on a quotation
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PageBackButton text="Cancel" />
            <Button
              onClick={handleCreateInvoice}
              disabled={isPending || !canSubmit}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create invoice
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Step 1: details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StepBadge step={1} done={!!quotation && !!dueDate} />
                Invoice details
              </CardTitle>
              <CardDescription>
                Choose the quotation to bill and when payment is due.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="quotation">Quotation</FieldLabel>
                  <FieldContent>
                    <QuotationPicker
                      id="quotation"
                      value={quotation}
                      onChange={setQuotation}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="due-date">Due date</FieldLabel>
                  <FieldContent>
                    <DatePicker
                      key={dueDate?.toDateString() ?? "empty"}
                      id="due-date"
                      placeholder="Pick a date"
                      initialDate={dueDate}
                      onDateChanged={setDueDate}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {DUE_PRESETS.map((days) => {
                        const preset = addDays(days)
                        const active =
                          dueDate?.toDateString() === preset.toDateString()
                        return (
                          <Button
                            key={days}
                            type="button"
                            size="sm"
                            variant={active ? "secondary" : "ghost"}
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setDueDate(preset)}
                          >
                            Net {days}
                          </Button>
                        )
                      })}
                    </div>
                  </FieldContent>
                </Field>
              </div>

              {quotation && <BillTo quotation={quotation} />}
            </CardContent>
          </Card>

          {/* Step 2: shipments */}
          <Card className="gap-0 overflow-hidden pb-0">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <StepBadge step={2} done={selected.length > 0} />
                Shipments to bill
              </CardTitle>
              <CardDescription>
                Completed shipments with captured trip details.
              </CardDescription>
              {allShipments.length > 0 && (
                <CardAction>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-muted-foreground tabular-nums">
                      {selected.length} of {allShipments.length} selected
                    </span>
                  </label>
                </CardAction>
              )}
            </CardHeader>

            {!quotation ? (
              <ShipmentsEmpty
                title="No quotation selected"
                description="Select a quotation above to list the shipments you can bill."
              />
            ) : isLoadingShipments ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : allShipments.length === 0 ? (
              <ShipmentsEmpty
                title="Nothing to bill yet"
                description="This quotation has no completed shipments with captured details."
              />
            ) : (
              <ul className="divide-y">
                {allShipments.map((shp) => (
                  <ShipmentRow
                    key={shp.id}
                    shipment={shp}
                    checked={selectedIds.includes(shp.id)}
                    onToggle={() => toggle(shp.id)}
                    fees={loadingFeesFor(shp)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Summary */}
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>
              {quotation ? (
                <>
                  {quotation.number} · {quotation.client.name}
                </>
              ) : (
                "Estimated totals for this invoice"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {selected.length > 0 ? (
              <ul className="space-y-2">
                {selected.map((shp) => (
                  <li key={shp.id} className="flex justify-between gap-3">
                    <span className="truncate text-muted-foreground">
                      {shp.number ?? "Shipment"}
                      {serviceDays(shp) > 1 && <> · {serviceDays(shp)} days</>}
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(shipmentAmount(shp).toString())}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-4 text-center text-muted-foreground">
                Selected shipments appear here
              </p>
            )}

            <dl className="space-y-2 border-t pt-4">
              <SummaryRow
                label="Subtotal"
                value={formatMoney(totals.subtotal.toString())}
              />
              {totals.fuel.gt(0) && (
                <SummaryRow
                  label="Fuel charges"
                  value={formatMoney(totals.fuel.toString())}
                />
              )}
              {totals.loading.gt(0) && (
                <SummaryRow
                  label="Loading & offloading"
                  value={formatMoney(totals.loading.toString())}
                />
              )}
              {defaultTaxRate && (
                <SummaryRow
                  label={`VAT (${defaultTaxRate.rate}%)`}
                  value={formatMoney(totals.tax.toString())}
                />
              )}
            </dl>

            <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-3">
              <span className="font-medium text-primary">Total</span>
              <span className="text-xl font-bold text-primary tabular-nums">
                {formatMoney(totals.grand.toString())}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="size-4" />
              {dueDate ? <>Due {formatDate(dueDate)}</> : "No due date set"}
            </div>

            <Button
              className="w-full"
              onClick={handleCreateInvoice}
              disabled={isPending || !canSubmit}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create invoice
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Final amounts are calculated when the invoice is saved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

function StepBadge({ step, done }: { step: number; done: boolean }) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
        done
          ? "border-primary bg-primary text-primary-foreground"
          : "text-muted-foreground"
      )}
    >
      {step}
    </span>
  )
}

function BillTo({ quotation }: { quotation: Quotation }) {
  const { client } = quotation
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary uppercase">
          {client.short_name || generateAvatorFallback(client.name)}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Bill to</p>
          <p className="truncate font-medium capitalize">{client.name}</p>
          <p className="text-xs text-muted-foreground">{client.number}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:items-end">
        {client.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {client.phone}
          </span>
        )}
        {client.email && (
          <span className="inline-flex items-center gap-1.5">
            <Mail className="size-3.5" />
            {client.email}
          </span>
        )}
      </div>
    </div>
  )
}

function ShipmentRow({
  shipment: shp,
  checked,
  onToggle,
  fees,
}: {
  shipment: Shipment
  checked: boolean
  onToggle: () => void
  fees: { loading: Decimal; offloading: Decimal } | null
}) {
  const days = serviceDays(shp)
  const fuel = toDecimal(shp.consumption?.total_fuel_charge)

  return (
    <li>
      <label
        className={cn(
          "flex cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-muted/40",
          checked && "bg-primary/5 hover:bg-primary/10"
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          className="mt-1"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="font-medium">
                {shp.number ?? "Unnumbered shipment"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(shp.actual_start)}
                {shp.actual_end && <> → {formatDateTime(shp.actual_end)}</>}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">
                {formatMoney(shipmentAmount(shp).toString())}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatMoney(shp.item.unit_price)} × {days} day
                {days === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {shp.vehicle && (
              <Chip icon={Truck}>
                {shp.vehicle.plate_number || shp.vehicle.number}
              </Chip>
            )}
            <Chip icon={RouteIcon}>
              {formatNumber(shp.consumption?.distance_km, { fallback: "—" })} km
            </Chip>
            <Chip icon={Gauge}>
              {formatNumber(shp.consumption?.start_mileage, { fallback: "—" })}
              {" → "}
              {formatNumber(shp.consumption?.end_mileage, { fallback: "—" })}
            </Chip>
            {shp.item.tonnage && (
              <Chip icon={Weight}>{formatNumber(shp.item.tonnage)} t</Chip>
            )}
            {fuel.gt(0) && (
              <Chip icon={Fuel}>Fuel {formatMoney(fuel.toString())}</Chip>
            )}
            {fees && (
              <Chip>
                Loading {formatMoney(fees.loading.toString())} · Offloading{" "}
                {formatMoney(fees.offloading.toString())}
              </Chip>
            )}
          </div>

          {(shp.contact_name || shp.driver) && (
            <p className="text-xs text-muted-foreground">
              {shp.contact_name && <>Contact: {shp.contact_name}</>}
              {shp.contact_name && shp.driver && " · "}
              {shp.driver && <>Driver: {shp.driver.full_name}</>}
            </p>
          )}
        </div>
      </label>
    </li>
  )
}

function Chip({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  )
}

function ShipmentsEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Empty className="m-5 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
