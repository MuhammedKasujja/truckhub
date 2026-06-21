import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"

export function VehicleFeatureForm() {
  const { data } = useVehicleConfigurations()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Features</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.features.map((feat) => (
          <div key={feat.id}>{feat.name}</div>
        ))}
      </CardContent>
    </Card>
  )
}
