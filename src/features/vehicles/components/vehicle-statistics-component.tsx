import { ButtonGroup } from "@/components/ui/button-group"
import { useVehicleStatistics } from "../hooks/use-invoice-statistics"
import { Button } from "@/components/ui/button"

export function VehicleStatisticsRow() {
  const { data } = useVehicleStatistics()

  return (
    <ButtonGroup className="flex w-full">
      <Button className="flex gap-4">
        <div>Available</div>
        <div>{data?.available}</div>
      </Button>
      <Button className="flex gap-4">
        <div>On Trip</div>
        <div>{data?.on_trip}</div>
      </Button>
      <Button className="flex gap-4">
        <div>Booked</div>
        <div>{data?.reserved}</div>
      </Button>
      <Button className="flex gap-4">
        <div>Maintenance</div>
        <div>{data?.maintenance}</div>
      </Button>
    </ButtonGroup>
  )
}
