import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarBrandPicker } from "@/features/settings/car-brand/components"
import { CarModelPicker } from "@/features/settings/car-model/components"
import { VehicleCategoryPicker } from "@/features/settings/vehicle-types/components"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { VehicleStatusPicker } from "./vehicle-status-picker"
import { EngineTypePicker, GearboxTypePicker } from "./vehicle-pickers"
import { Button } from "@/components/ui/button"
import { RotateCcwIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function VehicleFilterCard() {
  const search = useSearch({ from: "/_admin/vehicles/" })
  const navigate = useNavigate({ from: "/vehicles/" })

  return (
    <Card className="border border-dotted">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Now your search using the filters below
        </CardDescription>
        <CardAction>
          <Button
            size={'sm'}
            variant={"ghost"}
            onClick={() => navigate({ from: "/vehicles/" })}
          >
            <RotateCcwIcon className="size-3"/> Clear all
          </Button>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 pb-5">
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full space-y-4">
            <Label htmlFor="brand">Brand</Label>
            <CarBrandPicker
              id="brand"
              value={search.brand_id}
              onSelected={(brand) => {
                navigate({
                  search: {
                    ...search,
                    brand_id: brand?.id,
                    model_id: undefined,
                  },
                })
              }}
            />
          </div>
          <div className="w-full space-y-4">
            <Label htmlFor="car-model">Model</Label>
            <CarModelPicker
              id="car-model"
              carBrandId={search.brand_id}
              value={search.model_id}
              onSelected={(model) => {
                navigate({ search: { ...search, model_id: model?.id } })
              }}
            />
          </div>
          <div className="w-full space-y-4">
            <Label htmlFor="category">Category</Label>
            <VehicleCategoryPicker
              id="category"
              value={search.category_id}
              onSelected={(category) => {
                navigate({ search: { ...search, category_id: category?.id } })
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full space-y-4">
            <Label htmlFor="tonnage">Tonnage</Label>
            <Input
              id="tonnage"
              value={search.tonnage}
              onChange={(e) =>
                navigate({
                  search: { ...search, tonnage: e.target.value.toString() },
                })
              }
            />
          </div>
          <div className="w-full space-y-4">
            <Label htmlFor="consumption-rate">Consumption Rate</Label>
            <Input
              id="consumption-rate"
              value={search.consumption_rate}
              onChange={(e) =>
                navigate({
                  search: {
                    ...search,
                    consumption_rate: e.target.value.toString(),
                  },
                })
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full space-y-4">
            <Label htmlFor="status">Status</Label>
            <VehicleStatusPicker
              id="status"
              value={search.status}
              onSelected={(status) =>
                navigate({
                  search: {
                    ...search,
                    status: status ?? undefined,
                  },
                })
              }
            />
          </div>
          <div className="w-full space-y-4">
            <Label htmlFor="engine">Engine</Label>
            <EngineTypePicker
              id="engine"
              value={search.engine_type}
              onSelected={(engine) =>
                navigate({
                  search: {
                    ...search,
                    engine_type: engine ?? undefined,
                  },
                })
              }
            />
          </div>
          <div className="w-full space-y-4">
            <Label htmlFor="gearbox">Gearbox</Label>
            <GearboxTypePicker
              id="gearbox"
              value={search.gearbox}
              onSelected={(gearbox) =>
                navigate({
                  search: {
                    ...search,
                    gearbox: gearbox ?? undefined,
                  },
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
