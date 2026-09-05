import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { EntityPickerProps } from "@/common/types"
import { VehicleStatus, vehicleStatuses } from "../enums"

export function VehicleStatusPicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<VehicleStatus>) {
  return (
    <AutoComplete<VehicleStatus>
      id={id}
      options={[...vehicleStatuses]}
      loading={false}
      value={value}
      onChange={(status) => {
        onSelected?.(status)
      }}
      filterFn={(u, q) => u.toLowerCase().includes(q.toLowerCase())}
      label="Status"
      getOptionValue={(u) => u}
      renderOption={(u) => <span>{u}</span>}
    />
  )
}
