import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Truck } from "lucide-react"
import { VehicleCategoryForm } from "./vehicle-type-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createVehicleCategorysQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { useCreateVehicleCategory } from "../../hooks/use-vehicle-category"
import { VehicleCategory } from "../types"
import { VehicleCategoryTableActions } from "./vehicle-category-table-actions"

export function VehicleCategoryTable() {
  const search = useSearch({
    from: "/_admin/settings/vehicle-config/vehicle-types/",
  })
  const { data } = useSuspenseQuery(createVehicleCategorysQueryOptions(search))

  const { mutate: createCategory } = useCreateVehicleCategory()

  useFetchEror(data.error)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Can permission="config:vehicle_config:edit">
          <VehicleCategoryForm
            mode="create"
            onSubmit={(data) => createCategory(data)}
          />
        </Can>
      </div>

      {data.data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No vehicle categories yet. Add a category to see it here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((category) => (
            <VehicleCategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}

export function VehicleCategoryTableSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="h-40 bg-muted" />
          <CardHeader>
            <div className="h-5 w-2/3 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-1/3 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function VehicleCategoryCard({ category }: { category: VehicleCategory }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="h-40 bg-muted">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Truck className="size-12 text-muted-foreground" aria-hidden />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="truncate text-lg">{category.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {category.type}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <VehicleCategoryTableActions category={category} />
      </CardFooter>
    </Card>
  )
}
