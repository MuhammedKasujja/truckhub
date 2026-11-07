import { useMemo, useState } from "react"
import { useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CornerDownRight, Layers, Plus } from "lucide-react"
import { createVehicleCategorysQueryOptions } from "../query-options"
import { deleteVehicleCategoryFn } from "../services"
import { vehicleTypesList } from "../enums"
import { vehicleTypeMeta } from "../vehicle-type-meta"
import {
  ConfigCardMenu,
  ConfigGridSkeleton,
  ConfigToolbar,
  ConfirmDeleteDialog,
  FilterChip,
  MediaImage,
} from "../../_components/config-ui"
import { VehicleCategoryForm } from "./vehicle-type-form"
import type { VehicleType } from "../enums"
import type { VehicleCategory } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useTranslation } from "@/i18n"
import { formatPlural } from "@/lib/format"

type Dialog = { kind: "form" | "delete"; category?: VehicleCategory }

const categoryName = (c: Pick<VehicleCategory, "name" | "display_name">) =>
  c.display_name ?? c.name

export function VehicleCategoryTable() {
  const tr = useTranslation()
  const search = useSearch({
    from: "/_admin/settings/vehicle-config/vehicle-types/",
  })
  const {
    data: { data: categories, error },
  } = useSuspenseQuery(createVehicleCategorysQueryOptions(search))
  useFetchEror(error)

  const queryInvalidator = useQueryInvalidator()
  const [query, setQuery] = useState("")
  const [type, setType] = useState<VehicleType>()
  const [dialog, setDialog] = useState<Dialog>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const open = (next: Dialog) => {
    setDialog(next)
    setDialogOpen(true)
  }

  const childCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of categories) {
      if (c.parent_category_id) {
        map.set(c.parent_category_id, (map.get(c.parent_category_id) ?? 0) + 1)
      }
    }
    return map
  }, [categories])

  const typeCounts = useMemo(() => {
    const counts: Record<VehicleType, number> = { truck: 0, van: 0, car: 0 }
    for (const c of categories) if (c.type in counts) counts[c.type]++
    return counts
  }, [categories])

  // Main categories first, each followed by its sub-categories.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = categories.filter(
      (c) =>
        (!type || c.type === type) &&
        (!q ||
          categoryName(c).toLowerCase().includes(q) ||
          c.parent?.name.toLowerCase().includes(q))
    )
    const sortKey = (c: VehicleCategory) =>
      `${c.parent?.name ?? categoryName(c)}\u0000${c.parent ? categoryName(c) : ""}`
    return [...matches].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  }, [categories, query, type])

  const filtered = !!query || !!type
  const deleting = dialog?.kind === "delete" ? dialog.category : undefined
  const deletingChildren = deleting ? (childCounts.get(deleting.id) ?? 0) : 0

  return (
    <div className="flex flex-col gap-4">
      <ConfigToolbar
        search={query}
        onSearchChange={setQuery}
        placeholder="Search categories"
        filters={
          <div role="radiogroup" aria-label="Vehicle type" className="flex flex-wrap gap-1.5">
            <FilterChip
              label="All"
              count={categories.length}
              active={!type}
              onClick={() => setType(undefined)}
            />
            {vehicleTypesList.map((t) => (
              <FilterChip
                key={t}
                label={tr(`vehicleTypes.${t}`)}
                icon={vehicleTypeMeta[t].icon}
                count={typeCounts[t]}
                active={type === t}
                onClick={() => setType(type === t ? undefined : t)}
              />
            ))}
          </div>
        }
        action={
          <Can permission="config:vehicle_config:edit">
            <Button onClick={() => open({ kind: "form" })}>
              <Plus />
              Add category
            </Button>
          </Can>
        }
      />

      <p className="text-xs text-muted-foreground">
        {filtered
          ? `${visible.length} of ${formatPlural(categories.length, { singular: "category", plural: "categories" })}`
          : formatPlural(categories.length, { singular: "category", plural: "categories" })}
      </p>

      {visible.length === 0 ? (
        <SectionEmpty
          icon={Layers}
          title={filtered ? "No categories match" : "No vehicle categories yet"}
          description={
            filtered
              ? "Try a different search or type."
              : "Add categories like “Tipper truck” or “Minibus” to group your car models."
          }
          className="bg-card py-14"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              childCount={childCounts.get(category.id) ?? 0}
              typeLabel={tr(`vehicleTypes.${category.type}`)}
              onEdit={() => open({ kind: "form", category })}
              onDelete={() => open({ kind: "delete", category })}
            />
          ))}
        </div>
      )}

      <VehicleCategoryForm
        key={dialog?.category?.id ?? "new"}
        category={dialog?.kind === "form" ? dialog.category : undefined}
        defaultType={type}
        open={dialogOpen && dialog?.kind === "form"}
        onOpenChange={setDialogOpen}
      />
      <ConfirmDeleteDialog
        open={dialogOpen && dialog?.kind === "delete"}
        onOpenChange={setDialogOpen}
        title={`Delete ${deleting ? categoryName(deleting) : "category"}?`}
        description={
          deletingChildren > 0
            ? `It has ${formatPlural(deletingChildren, { singular: "sub-category", plural: "sub-categories" })}. This can't be undone.`
            : "This can't be undone."
        }
        onDelete={() => deleteVehicleCategoryFn({ data: { id: deleting!.id } })}
        onDeleted={() => queryInvalidator.settings.vehiclesTypes.list()}
      />
    </div>
  )
}

export function VehicleCategoryTableSkeleton() {
  return <ConfigGridSkeleton />
}

function CategoryCard({
  category,
  childCount,
  typeLabel,
  onEdit,
  onDelete,
}: {
  category: VehicleCategory
  childCount: number
  typeLabel: string
  onEdit: () => void
  onDelete: () => void
}) {
  const meta = vehicleTypeMeta[category.type] as
    | (typeof vehicleTypeMeta)[VehicleType]
    | undefined
  const TypeIcon = meta?.icon ?? Layers
  const name = categoryName(category)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md">
      <div className="relative">
        <MediaImage
          src={category.image_url}
          alt={name}
          icon={TypeIcon}
          fit="cover"
          className="aspect-16/10 border-b"
        />
        <Badge
          variant="outline"
          className="absolute top-3 left-3 bg-background/90 backdrop-blur"
        >
          <TypeIcon />
          {typeLabel}
        </Badge>
      </div>
      <div className="flex flex-1 items-start gap-2 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {name}
          </h3>
          {category.parent ? (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <CornerDownRight className="size-3 shrink-0" />
              Part of {category.parent.name}
            </p>
          ) : (
            <p className="truncate text-xs text-muted-foreground">
              Main category
              {childCount > 0 &&
                ` · ${formatPlural(childCount, { singular: "sub-category", plural: "sub-categories" })}`}
            </p>
          )}
        </div>
        <ConfigCardMenu label={name} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  )
}
