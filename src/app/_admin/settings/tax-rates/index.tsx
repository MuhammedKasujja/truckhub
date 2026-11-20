import { useCallback, useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Percent, RotateCcw, Save, SquareSigma, Star } from "lucide-react"
import type { TaxRate } from "@/features/settings/tax-rates/types"
import type { EntityId } from "@/schemas"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import {
  SettingsPage,
  SettingsPageHeader,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { useEditSettings } from "@/features/settings/hooks/use-settings"
import {
  TaxRatePicker,
  TaxRatesTable,
} from "@/features/settings/tax-rates/components"
import { TaxRateForm } from "@/features/settings/tax-rates/components/tax-rate-form"
import {
  useDefaultTaxRate,
  useTaxRatesSuspense,
} from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { createTaxRatesQueryOptions } from "@/features/settings/tax-rates/query-options"
import { formatNumber, formatPlural } from "@/lib/format"

export const Route = createFileRoute("/_admin/settings/tax-rates/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createTaxRatesQueryOptions()),
})

function RouteComponent() {
  const defaultTaxRate = useDefaultTaxRate()
  const { data: taxRates } = useTaxRatesSuspense()
  const [taxRateId, setTaxRateId] = useState<EntityId>()
  const { mutate: updateSettings, isPending } = useEditSettings()

  useEffect(() => {
    setTaxRateId(defaultTaxRate?.id)
  }, [defaultTaxRate])

  const isChanged = (defaultTaxRate?.id ?? undefined) !== taxRateId
  const selected = taxRates.find((t) => t.id === taxRateId)

  function saveDefault() {
    if (!isChanged) return
    updateSettings({ default_tax_rate_id: taxRateId ?? null })
  }

  const makeDefault = useCallback(
    (taxRate: TaxRate) => updateSettings({ default_tax_rate_id: taxRate.id }),
    [updateSettings]
  )

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={SquareSigma}
        title="Tax rates"
        description="The rates you can apply to invoice and quotation items, and the one new items start with."
        actions={
          <Can permission="config:tax_rates:create">
            <TaxRateForm />
          </Can>
        }
      />

      <SettingsSection
        icon={Star}
        title="Default tax rate"
        description="Pre-selected on new invoice and quotation items"
        footer={
          isChanged && (
            <Can permission="config:edit">
              <span className="mr-auto text-xs text-muted-foreground">
                Unsaved change
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTaxRateId(defaultTaxRate?.id)}
                disabled={isPending}
              >
                <RotateCcw />
                Reset
              </Button>
              <Button size="sm" onClick={saveDefault} disabled={isPending}>
                <Save />
                Save default
              </Button>
            </Can>
          )
        }
      >
        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl border bg-muted/30">
              <span className="text-xl leading-none font-bold tracking-tight tabular-nums">
                {selected ? formatNumber(selected.rate, { fallback: "0" }) : "–"}
              </span>
              <Percent className="mt-1 size-3 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {isChanged ? "Will become" : "Currently"}
              </p>
              <p className="truncate text-base font-semibold">
                {selected?.name ?? "No default"}
              </p>
              {!selected && (
                <p className="text-xs text-muted-foreground">
                  Items start without tax.
                </p>
              )}
            </div>
          </div>
          <Can permission="config:edit">
            <TaxRatePicker
              value={taxRateId}
              onSelected={(value) => setTaxRateId(value?.id)}
            />
          </Can>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Percent}
        title="All tax rates"
        description={formatPlural(taxRates.length, {
          singular: "rate",
          plural: "rates",
        })}
        contentClassName="p-0"
      >
        <TaxRatesTable
          defaultTaxRateId={defaultTaxRate?.id}
          onMakeDefault={makeDefault}
        />
      </SettingsSection>
    </SettingsPage>
  )
}
