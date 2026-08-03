import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { BookingRoute } from "../schemas"
import { EntityId } from "@/schemas"
import { useBookingRoutes } from "../hooks/use-booking-routes"

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
