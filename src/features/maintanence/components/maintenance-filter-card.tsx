import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { VehiclePicker } from "@/features/vehicles/components"
import { RotateCcwIcon } from "lucide-react"
import { maintanenceTypes } from "../enums"
import { MaintenanceSearchParamsInput } from "../schemas"

const typeOptions = maintanenceTypes.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}))

type MaintenanceFilterCardProps = {
  search: MaintenanceSearchParamsInput
  onSearchChange: (updates: Partial<MaintenanceSearchParamsInput>) => void
}

export function MaintenanceFilterCard({
  search,
  onSearchChange,
}: MaintenanceFilterCardProps) {
  return (
    <Card className="border border-dotted">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Maintenance filters</CardTitle>
        <CardAction>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs"
          onClick={() =>
            onSearchChange({
              per_column: 50,
              include_cancelled: false,
              vehicle_id: undefined,
              type: undefined,
            })
          }
        >
          <RotateCcwIcon className="size-3" />
          Clear all
        </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="maintenance-vehicle">Vehicle</Label>
          <VehiclePicker
            id="maintenance-vehicle"
            value={search.vehicle_id}
            onChange={(vehicle) => {
              onSearchChange({ vehicle_id: vehicle?.id ?? undefined })
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maintenance-type">Type</Label>
          <Select
            value={search.type ?? "all"}
            onValueChange={(value) => {
              const type = maintanenceTypes.find((item) => item === value)
              onSearchChange({ type })
            }}
          >
            <SelectTrigger id="maintenance-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maintenance-per-column">Records per column</Label>
          <Select
            value={String(search.per_column)}
            onValueChange={(value) => {
              onSearchChange({ per_column: Number(value) })
            }}
          >
            <SelectTrigger id="maintenance-per-column">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 self-end pb-2">
          <Switch
            id="maintenance-include-cancelled"
            checked={search.include_cancelled}
            onCheckedChange={(includeCancelled) => {
              onSearchChange({ include_cancelled: includeCancelled })
            }}
          />
          <Label htmlFor="maintenance-include-cancelled">
            Include cancelled
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
