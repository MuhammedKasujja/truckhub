import { useMemo, useState } from "react"
import { Link, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, CarFront, Plus } from "lucide-react"
import { createCarBrandsQueryOptions } from "../query-options"
import { deleteCarBrandFn } from "../services"
import {
  ConfigCardMenu,
  ConfigToolbar,
  ConfirmDeleteDialog,
} from "../../_components/config-ui"
import { CarBrandForm } from "./car-brand-form"
import type { CarBrand } from "../types"
import type { CarModel } from "@/features/settings/vehicle-config/car-model/types"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { useVehicleConfigurationsQuery } from "@/features/settings/hooks/use-vehicle-configurations"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatPlural } from "@/lib/format"

type Dialog = { kind: "form" | "delete"; brand?: CarBrand }

export function CarBrandList() {
  const search = useSearch({
    from: "/_admin/settings/vehicle-config/car-brands/",
  })
  const {
    data: { data: brands, error },
  } = useSuspenseQuery(createCarBrandsQueryOptions(search))
  useFetchEror(error)

  // Model counts come from the cached vehicle configuration.
  const { data: config } = useVehicleConfigurationsQuery()
  const modelsByBrand = useMemo(() => {
    const map = new Map<string, CarModel[]>()
    for (const model of config?.car_models ?? []) {
      map.set(model.car_brand_id, [...(map.get(model.car_brand_id) ?? []), model])
    }
    return map
  }, [config])

  const queryInvalidator = useQueryInvalidator()
  const [query, setQuery] = useState("")
  const [dialog, setDialog] = useState<Dialog>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const open = (next: Dialog) => {
    setDialog(next)
    setDialogOpen(true)
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...brands]
      .filter((b) => !q || b.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [brands, query])

  const deleting = dialog?.kind === "delete" ? dialog.brand : undefined
  const deletingModels = deleting ? (modelsByBrand.get(deleting.id)?.length ?? 0) : 0

  return (
    <div className="flex flex-col gap-4">
      <ConfigToolbar
        search={query}
        onSearchChange={setQuery}
        placeholder="Search car makes"
        action={
          <Can permission="config:vehicle_config:edit">
            <Button onClick={() => open({ kind: "form" })}>
              <Plus />
              Add car make
            </Button>
          </Can>
        }
      />

      <p className="text-xs text-muted-foreground">
        {query
          ? `${visible.length} of ${formatPlural(brands.length, { singular: "make", plural: "makes" })}`
          : formatPlural(brands.length, { singular: "make", plural: "makes" })}
      </p>

      {visible.length === 0 ? (
        <SectionEmpty
          icon={CarFront}
          title={query ? "No makes match" : "No car makes yet"}
          description={
            query
              ? "Try a different name."
              : "Add the manufacturers of the vehicles you run, then add their models."
          }
          className="bg-card py-14"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              models={config ? (modelsByBrand.get(brand.id) ?? []) : undefined}
              onEdit={() => open({ kind: "form", brand })}
              onDelete={() => open({ kind: "delete", brand })}
            />
          ))}
        </div>
      )}

      <CarBrandForm
        key={dialog?.brand?.id ?? "new"}
        initialData={dialog?.kind === "form" ? dialog.brand : undefined}
        open={dialogOpen && dialog?.kind === "form"}
        onOpenChange={setDialogOpen}
      />
      <ConfirmDeleteDialog
        open={dialogOpen && dialog?.kind === "delete"}
        onOpenChange={setDialogOpen}
        title={`Delete ${deleting?.name ?? "car make"}?`}
        description={
          deletingModels > 0
            ? `${formatPlural(deletingModels, { singular: "model belongs", plural: "models belong" })} to this make. This can't be undone.`
            : "This can't be undone."
        }
        onDelete={() => deleteCarBrandFn({ data: { id: deleting!.id } })}
        onDeleted={() => queryInvalidator.settings.carBrands.list()}
      />
    </div>
  )
}

function BrandCard({
  brand,
  models,
  onEdit,
  onDelete,
}: {
  brand: CarBrand
  /** Undefined while the vehicle configuration loads. */
  models?: CarModel[]
  onEdit: () => void
  onDelete: () => void
}) {
  const preview = models?.slice(0, 3).map((m) => m.name).join(", ")
  return (
    <article className="group flex flex-col rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
          {brand.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{brand.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {models === undefined
              ? " "
              : models.length === 0
                ? "No models yet"
                : `${formatPlural(models.length, { singular: "model", plural: "models" })} · ${preview}${models.length > 3 ? "…" : ""}`}
          </p>
        </div>
        <ConfigCardMenu label={brand.name} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <Link
        to="/settings/vehicle-config/car-models"
        search={(prev) => ({ ...prev, brand: brand.id })}
        className="mt-auto flex items-center justify-between border-t px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        View models
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  )
}
