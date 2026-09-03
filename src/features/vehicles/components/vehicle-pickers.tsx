import { Vehicle } from "../types"
import { vehicleDetailsQueryOptions, vehicleSearchQueryOptions } from "../query-options"
import { createEntityPicker } from "@/components/entity-picker"
import { VehicleListSearchParams } from "../schemas"

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
