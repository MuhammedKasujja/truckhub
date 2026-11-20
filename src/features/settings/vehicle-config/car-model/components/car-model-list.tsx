import { useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Car, Fuel, Layers, Plus } from "lucide-react"
import { createCarModelsListQueryOptions } from "../query-options"
import { deleteCarModelFn } from "../services"
import {
  ConfigCardMenu,
  ConfigToolbar,
  ConfirmDeleteDialog,
  MediaImage,
} from "../../_components/config-ui"
import { CarModelForm } from "./car-model-form"
import type { CarModel } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { useVehicleConfigurationsQuery } from "@/features/settings/hooks/use-vehicle-configurations"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatNumber, formatPlural } from "@/lib/format"

const ALL = "__all__"

type Dialog = { kind: "form" | "delete"; model?: CarModel }

export function CarModelList() {
  const search = useSearch({
    from: "/_admin/settings/vehicle-config/car-models/",
  })
  const navigate = useNavigate({ from: "/settings/vehicle-config/car-models/" })
  const {
    data: { data: models, error },
  } = useSuspenseQuery(createCarModelsListQueryOptions(search))
  useFetchEror(error)

  const { data: config } = useVehicleConfigurationsQuery()
  const categoryNames = useMemo(
    () =>
      new Map(
        (config?.vehicle_types ?? []).map((c) => [c.id, c.display_name ?? c.name])
      ),
    [config]
  )

  // Makes that have at least one model, for the filter.
  const brands = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>()
    for (const m of models) {
      const entry = map.get(m.car_brand_id) ?? {
        id: m.car_brand_id,
        name: m.car_brand.name,
        count: 0,
      }
      entry.count++
      map.set(m.car_brand_id, entry)
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [models])

  const queryInvalidator = useQueryInvalidator()
  const [query, setQuery] = useState("")
  const [dialog, setDialog] = useState<Dialog>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const open = (next: Dialog) => {
    setDialog(next)
    setDialogOpen(true)
  }

  const brandId = search.brand
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return models
      .filter((m) => !brandId || m.car_brand_id === brandId)
      .filter(
        (m) =>
          !q ||
          `${m.car_brand.name} ${m.name} ${m.manufacture_year ?? ""}`
            .toLowerCase()
            .includes(q)
      )
      .sort(
        (a, b) =>
          a.car_brand.name.localeCompare(b.car_brand.name) ||
          a.name.localeCompare(b.name)
      )
  }, [models, brandId, query])

  const filtered = !!query || !!brandId
  const deleting = dialog?.kind === "delete" ? dialog.model : undefined

  function setBrand(value?: string) {
    navigate({ search: (prev) => ({ ...prev, brand: value }), replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <ConfigToolbar
        search={query}
        onSearchChange={setQuery}
        placeholder="Search models"
        filters={
          <Select
            value={brandId ?? ALL}
            onValueChange={(value) => setBrand(value === ALL ? undefined : value)}
          >
            <SelectTrigger className="w-full sm:w-52" aria-label="Filter by make">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All makes ({models.length})</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name} ({b.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        action={
          <Can permission="config:vehicle_config:edit">
            <Button onClick={() => open({ kind: "form" })}>
              <Plus />
              Add car model
            </Button>
          </Can>
        }
      />

      <p className="text-xs text-muted-foreground">
        {filtered
          ? `${visible.length} of ${formatPlural(models.length, { singular: "model", plural: "models" })}`
          : formatPlural(models.length, { singular: "model", plural: "models" })}
      </p>

      {visible.length === 0 ? (
        <SectionEmpty
          icon={Car}
          title={filtered ? "No models match" : "No car models yet"}
          description={
            filtered
              ? "Try a different search or make."
              : "Add the models you run, with their category and fuel consumption."
          }
          className="bg-card py-14"
          action={
            filtered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setBrand(undefined)
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              categoryName={categoryNames.get(model.vehicle_category_id)}
              onEdit={() => open({ kind: "form", model })}
              onDelete={() => open({ kind: "delete", model })}
            />
          ))}
        </div>
      )}

      <CarModelForm
        key={dialog?.model?.id ?? "new"}
        model={dialog?.kind === "form" ? dialog.model : undefined}
        defaultBrandId={brandId}
        open={dialogOpen && dialog?.kind === "form"}
        onOpenChange={setDialogOpen}
      />
      <ConfirmDeleteDialog
        open={dialogOpen && dialog?.kind === "delete"}
        onOpenChange={setDialogOpen}
        title={
          deleting
            ? `Delete ${deleting.car_brand.name} ${deleting.name}?`
            : "Delete car model?"
        }
        description="This can't be undone."
        onDelete={() => deleteCarModelFn({ data: { id: deleting!.id } })}
        onDeleted={() => queryInvalidator.settings.carModels.list()}
      />
    </div>
  )
}

function ModelCard({
  model,
  categoryName,
  onEdit,
  onDelete,
}: {
  model: CarModel
  categoryName?: string
  onEdit: () => void
  onDelete: () => void
}) {
  const label = `${model.car_brand.name} ${model.name}`
  const consumption = Number(model.consumption_rate)
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md">
      <MediaImage
        src={model.image_url}
        alt={label}
        icon={Car}
        className="aspect-16/10 border-b"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {model.car_brand.name}
            </p>
            <h3 className="truncate text-base font-semibold tracking-tight">
              {model.name}
            </h3>
          </div>
          {model.manufacture_year && (
            <Badge variant="outline" className="tabular-nums">
              {model.manufacture_year}
            </Badge>
          )}
          <ConfigCardMenu label={label} onEdit={onEdit} onDelete={onDelete} />
        </div>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="size-3.5" />
            {categoryName ?? "No category"}
          </span>
          <span className="flex items-center gap-1.5 tabular-nums">
            <Fuel className="size-3.5" />
            {consumption > 0 ? `${formatNumber(consumption)} km/l` : "Not set"}
          </span>
        </div>
      </div>
    </article>
  )
}
