import {  EngineType, EngineTypes, Vehicle } from "../types"
import { vehicleDetailsQueryOptions, vehicleSearchQueryOptions } from "../query-options"
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
    renderOption: (v) => v.plate_number,
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