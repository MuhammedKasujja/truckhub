import { useBookingRoutes } from "../hooks/use-booking-routes"
import type { FieldValues } from "react-hook-form"
import type { BookingRoute } from "../schemas"
import type { EntityId } from "@/schemas"
import type { EntityPickerProps } from "@/common/types"
import type {
  FormAutoCompleteProps} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete";
import {
  FormAutoComplete
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { AutoComplete } from "@/components/ui/autocomplete-modified"

export function BookingRoutePicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<BookingRoute>) {
  const { routes, isLoading } = useBookingRoutes()

  return (
    <AutoComplete<BookingRoute>
      id={id}
      options={routes}
      loading={isLoading}
      value={value}
      onChange={(route) => {
        onSelected?.(route)
      }}
      filterFn={(route, q) =>
        route.destination.toLowerCase().includes(q.toLowerCase())
      }
      label="Routes"
      getOptionValue={(route) => route.id}
      renderOption={(route) => (
        <p>
          {route.destination}
          <span className="text-muted-foreground">
            ({route.min_hrs} - {route.max_hrs})
          </span>
        </p>
      )}
    />
  )
}

export function BookingRoutePickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  carBrandId,
  ...props
}: FormAutoCompleteProps<TFieldValues, BookingRoute> & {
  carBrandId?: EntityId | null
}) {
  const { routes, isLoading } = useBookingRoutes()

  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={routes}
      control={control}
      label={label}
      remote={remote}
      //   onSearch={(q) => setQuery(q)}
      filterFn={(r, q) => r.destination.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderOption={(route) => (
        <p>
          {route.destination}
          <span className="text-muted-foreground">
            ({route.min_hrs} - {route.max_hrs})
          </span>
        </p>
      )}
      onSelected={onSelected}
      {...props}
    />
  )
}
