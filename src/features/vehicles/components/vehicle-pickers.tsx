import {
  EngineType,
  EngineTypes,
  Gearbox,
  vehicleTransmissionList,
  Vehicle,
} from "../types"
import {
  vehicleDetailsQueryOptions,
  vehicleSearchQueryOptions,
} from "../query-options"
import { createEntityPicker } from "@/components/entity-picker"
import { VehicleListSearchParams } from "../schemas"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { EntityPickerProps } from "@/common/types"

export const { Picker: VehiclePicker, PickerField: VehiclePickerField } =
  createEntityPicker<Vehicle, VehicleListSearchParams>({
    mode: "remote",
    entityName: "vehicle",
    listQueryOptions: vehicleSearchQueryOptions,
    detailQueryOptions: vehicleDetailsQueryOptions,
    defaultSearchParams: { search: "", perPage: 20, page: 1 },
    getOptionValue: (v) => v.id,
    renderOption: (v) => (
      <div>
        <div>
          {v.car_model.car_brand.name} {v.car_model.name} {v.year}
        </div>
        <div className="text-muted-foreground text-xs">{v.plate_number}</div>
      </div>
    ),
    renderValue:(v) => (
      <div>
        <div>
          {v.car_model.car_brand.name} {v.car_model.name} {v.year}
        </div>
      </div>
    ),
    // createRoute: "/vehicles/new",
    label: "Vehicle",
  })

export function EngineTypePicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<EngineType>) {
  return (
    <AutoComplete<EngineType>
      id={id}
      options={[...EngineTypes]}
      loading={false}
      value={value}
      onChange={(status) => {
        onSelected?.(status)
      }}
      filterFn={(u, q) => u.toLowerCase().includes(q.toLowerCase())}
      label="Engine"
      getOptionValue={(u) => u}
      renderOption={(u) => <span>{u}</span>}
    />
  )
}

export function GearboxTypePicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<Gearbox>) {
  return (
    <AutoComplete<Gearbox>
      id={id}
      options={[...vehicleTransmissionList]}
      loading={false}
      value={value}
      onChange={(status) => {
        onSelected?.(status)
      }}
      filterFn={(u, q) => u.toLowerCase().includes(q.toLowerCase())}
      label="Transmission"
      getOptionValue={(u) => u}
      renderOption={(u) => <span>{u}</span>}
    />
  )
}
