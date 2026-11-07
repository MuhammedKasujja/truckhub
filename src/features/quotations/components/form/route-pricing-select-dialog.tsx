import { useClientActiveRoutingPricing } from "@/features/clients/hooks/use-client-route-pricing"
import { formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EntityId } from "@/schemas"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  createRouteQuotationLineItemSchema,
  Route,
  routePricingsSchema,
  RoutePricingStruct,
  RouteLineItemRequest,
} from "@/features/quotations/schemas"
import { MapPin, Route as RouteIcon, Weight } from "lucide-react"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateRouteEmptyLineItem } from "../../utils"
import {
  MoneyField,
  NumberField,
  SelectField,
  SwitchField,
} from "@/components/ui/form-fields"
import { ENGINE_MODES } from "@/common/config"
import { useCompanyActiveRoutePricings } from "@/features/settings/pricing/hooks/use-company-routes-pricings"
import { RouteTonnagePricingGrid } from "@/features/settings/pricing/components/route-pricing/route-tonnage-pricing"
import { RoutePricingRow } from "@/features/settings/pricing/schemas"
import Decimal from "decimal.js"
import { RouteSummary } from "./routes-dialog"
import {
  ConfigSection,
  LineItemDialog,
  LineTotals,
  PickHint,
  RoundTripField,
} from "./line-item-dialog"

const formSchema = z.object({
  ...createRouteQuotationLineItemSchema.shape,
  routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type RoutePricingDialogProps = {
  clientId: EntityId
  open: boolean
  selectedPricings: RoutePricingStruct[]
  onOpenChange: (v: boolean) => void
  lineItem?: RouteLineItemRequest
  onLineItemAdded: (lineItem: RouteLineItemRequest) => void
}

export function RoutePricingSelectDialog({
  clientId,
  open,
  selectedPricings,
  onOpenChange,
  lineItem,
  onLineItemAdded,
}: RoutePricingDialogProps) {
  const { data: clientPricings } = useClientActiveRoutingPricing(clientId)
  const { data: companyPricings } = useCompanyActiveRoutePricings()
  const pricingRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [route, setRoute] = useState<Route>()

  const pricings = useMemo(() => {
    // if (isFetching) return undefined

    if (clientPricings) return clientPricings

    return companyPricings
  }, [clientPricings, companyPricings])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: lineItem
      ? { ...lineItem, routes: selectedPricings ?? [] }
      : {
          ...generateRouteEmptyLineItem(),
          routes: selectedPricings ?? [],
        },
    mode: "onChange",
  })

  const { watch } = form

  const routes = watch("routes")
  const quantity = watch("quantity")
  const isRoundTrip = watch("is_round_trip")
  const tonnage = watch("tonnage")
  const subtotal = watch("subtotal")
  const discount = watch("discount")
  const lineTotal = watch("line_total")
  const [selectedRoutes, setSelectedRoutes] = useState<RoutePricingRow[]>([])

  useEffect(() => {
    form.setValue(
      "routes",
      selectedRoutes.map((r) => ({ ...r, tempId: r.routeId }))
    )
  }, [selectedRoutes])

  useEffect(() => {
    const pricings = routes.map((r) => r.pricings).flat()
    const activePricing = pricings.find(
      (p) => tonnage <= Number(p.maxTons) && tonnage >= Number(p.minTons)
    )
    const unitPrice = new Decimal(activePricing?.price ?? "0")
    const subtotal = unitPrice.times(quantity ?? "0").times(isRoundTrip ? 2 : 1)
    const lineTotal = subtotal.minus(discount ?? 0)
    form.setValue("unit_price", unitPrice.toString())
    form.setValue("subtotal", subtotal.toString())
    form.setValue("line_total", lineTotal.toString())
  }, [tonnage, routes, isRoundTrip, quantity, discount])

  useEffect(() => {
    if (!open) return
    if (lineItem) {
      form.reset({ ...lineItem, routes: [] })
      setRoute(lineItem.route)
    } else {
      form.reset({ ...generateRouteEmptyLineItem(), routes: [] })
      setRoute(undefined)
    }
    setSelectedRoutes([])
  }, [open, lineItem])

  useEffect(() => {
    if (tonnage == null) return

    routes.forEach((route) => {
      const pricing = route.pricings.find(
        (p) => tonnage >= Number(p.minTons) && tonnage <= Number(p.maxTons)
      )

      if (!pricing) return

      const key = `${route.routeId}-${pricing.minTons}-${pricing.maxTons}`

      pricingRefs.current[key]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    })
  }, [tonnage, routes])

  function handleSubmit() {
    form.handleSubmit(
      (data) => {
        const title = `${data.routes?.at(0)?.origin} -> ${data.routes?.at(0)?.destination}`
        const { routes: _, ...rest } = data
        onLineItemAdded({ ...rest, display_name: title })
        onOpenChange(false)
      },
      (errors) => {
        console.log("Form Errors", errors)
      }
    )()
  }

  const routesError = form.formState.errors.routes?.message

  return (
    <LineItemDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={RouteIcon}
      title="Route haulage"
      description={
        routes.length
          ? routes.map((r) => `${r.origin} → ${r.destination}`).join(", ")
          : "Pick a route and tonnage band from the price list."
      }
      isEditing={!!lineItem}
      lineTotal={lineTotal}
      onSubmit={handleSubmit}
      footerNote={
        routesError ? (
          <span className="text-destructive">{routesError}</span>
        ) : (
          `${routes.length} ${routes.length === 1 ? "route" : "routes"} selected`
        )
      }
      picker={
        <RouteTonnagePricingGrid
          isSelectable
          routes={pricings?.routes ?? []}
          effectiveDate={pricings?.effective_date ?? new Date().toDateString()}
          title={
            clientPricings ? "Client route pricing" : "Company route pricing"
          }
          onRowSelect={(rows) => {
            setSelectedRoutes(rows)
            form.setValue("route_id", rows?.at(0)?.routeId ?? "")
          }}
        />
      }
      totals={
        <LineTotals
          subtotal={subtotal}
          discount={discount}
          lineTotal={lineTotal}
          isRoundTrip={isRoundTrip}
        >
          <div className="grid grid-cols-2 gap-3">
            <MoneyField
              label="Unit price"
              control={form.control}
              name="unit_price"
            />
            <MoneyField
              required={false}
              label="Discount"
              control={form.control}
              name="discount"
            />
          </div>
        </LineTotals>
      }
    >
      {routes.length === 0 && (
        <PickHint
          icon={RouteIcon}
          title="No route selected"
          description="Pick a row in the price list to add it here."
        />
      )}
      {routes.map((r) => (
        <div
          key={r.routeId}
          className="overflow-hidden rounded-xl border bg-card shadow-xs"
        >
          <div className="flex items-center gap-2 px-4 pt-3.5 text-sm">
            <span className="size-2.5 shrink-0 rounded-full border-2 border-foreground" />
            <span className="truncate font-semibold" title={r.origin}>
              {r.origin}
            </span>
            <span className="h-px min-w-6 flex-1 border-t border-dashed" />
            <MapPin className="size-4 shrink-0" />
            <span className="truncate font-semibold" title={r.destination}>
              {r.destination}
            </span>
          </div>
          <p className="px-4 pt-1 text-xs text-muted-foreground tabular-nums">
            {formatNumber(r.distanceKm)} km · price by tonnage
          </p>
          <div className="overflow-x-auto px-4 pt-3 pb-3.5">
            <div className="flex w-max gap-2">
              {r.pricings.map((p) => {
                const key = `${r.routeId}-${p.minTons}-${p.maxTons}`
                const isSelected =
                  tonnage != null &&
                  tonnage >= Number(p.minTons) &&
                  tonnage <= Number(p.maxTons)
                return (
                  <div
                    key={key}
                    ref={(el) => {
                      pricingRefs.current[key] = el
                    }}
                    className={cn(
                      "flex min-w-26 shrink-0 flex-col gap-0.5 rounded-lg border px-3 py-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "bg-muted/30"
                    )}
                  >
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {p.minTons}–{p.maxTons} t
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap tabular-nums",
                        isSelected && "text-primary"
                      )}
                    >
                      {formatMoney(p.price)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
      <ConfigSection
        icon={Weight}
        title="Load"
        description="Tonnage picks the matching price band"
      >
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            required={false}
            label="Tonnage"
            control={form.control}
            name="tonnage"
          />
          <NumberField
            required={false}
            label="Quantity"
            control={form.control}
            name="quantity"
          />
          <SelectField
            label={"Engine"}
            control={form.control}
            name={"engine_mode"}
            required={false}
            placeholder="Select engine"
            options={ENGINE_MODES.map((opt) => ({
              label: `${opt}`,
              value: `${opt}`,
            }))}
          />
          <NumberField
            required={false}
            label="Consumption (km/l)"
            control={form.control}
            name="estimated_consumption_rate_km"
          />
        </div>
        <div className="grid gap-2">
          <SwitchField
            label={"With driver"}
            name={"with_driver"}
            control={form.control}
          />
          <SwitchField
            label={"With loaders"}
            name={"with_loaders"}
            control={form.control}
          />
        </div>
      </ConfigSection>
      <RoundTripField control={form.control} name="is_round_trip" />
      <RouteSummary
        route={route}
        onEdit={(r) => {
          form.setValue("route", r)
          setRoute(r)
        }}
      />
    </LineItemDialog>
  )
}
