import { useSearch } from "@tanstack/react-router"
import { VehicleCard } from "./vehicle-card"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createVehiclesListQueryOptions } from "../query-options"

export function VehicleCardList() {
  const search = useSearch({ from: "/_admin/vehicles/" })
  const {
    data: { data: vehicles, pagination },
    error,
  } = useSuspenseQuery(createVehiclesListQueryOptions(search))

  if (vehicles.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No vehicles yet. Add a vehicle to see it here.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
