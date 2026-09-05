import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarBrandPicker } from "@/features/settings/car-brand/components"
import { CarModelPicker } from "@/features/settings/car-model/components"
import { VehicleCategoryPicker } from "@/features/settings/vehicle-types/components"
import { useNavigate, useSearch } from "@tanstack/react-router"

export function VehicleFilterCard() {
  const search = useSearch({ from: "/_admin/vehicles/" })
  const navigate = useNavigate({ from: "/vehicles/" })

  return (
    <Card className="border border-dotted">
      <CardContent className="space-y-4">
        <Label htmlFor="brand">Brand</Label>
        <CarBrandPicker
          id="brand"
          value={search.brand_id}
          onSelected={(brand) => {
            navigate({ search: { ...search, brand_id: brand?.id } })
          }}
        />
        <Label htmlFor="car-model">Model</Label>
        <CarModelPicker
          id="car-model"
          value={search.model_id}
          onSelected={(model) => {
            navigate({ search: { ...search, model_id: model?.id } })
          }}
        />
        <Label htmlFor="category">Category</Label>
        <VehicleCategoryPicker
          id="category"
          value={search.category_id}
          onSelected={(category) => {
            navigate({ search: { ...search, category_id: category?.id } })
          }}
        />
        <Label htmlFor="tonnage">Tonnage</Label>
        <Input
          id="tonnage"
          value={search.tonnage}
          onChange={(e) =>
            navigate({ search: { ...search, tonnage: e.target.value.toString() } })
          }
        />
        <Label htmlFor="consumption-rate">Consumption Rate</Label>
        <Input
          id="consumption-rate"
          value={search.consumption_rate}
          onChange={(e) =>
            navigate({
              search: { ...search, consumption_rate: e.target.value.toString() },
            })
          }
        />
      </CardContent>
    </Card>
  )
}
