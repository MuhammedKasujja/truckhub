import { useEffect, useState } from "react"
import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { CarModel } from "../types"
import { useVehicleConfigurationsQuery } from "../../hooks/use-vehicle-configurations"
import { EntityId } from "@/schemas"

export function CarModelPicker({
  value,
  id,
  onSelected,
  carBrandId,
}: EntityPickerProps<CarModel> & { carBrandId?: EntityId | null }) {
  //   const [query, setQuery] = useState("")
  const { data: vehicleCofig, isLoading } = useVehicleConfigurationsQuery()
  const [models, setModels] = useState<CarModel[]>([])

  useEffect(() => {
    let brandModels = vehicleCofig?.car_models
    if (carBrandId) {
      brandModels = brandModels?.filter(
        (model) => model.car_brand_id === carBrandId
      )
    }
    setModels(brandModels ?? [])
  }, [carBrandId, vehicleCofig])

  return (
    <AutoComplete<CarModel>
      id={id}
      options={models}
      loading={isLoading}
      value={value}
      onChange={(model) => {
        onSelected?.(model)
      }}
      filterFn={(model, q) => model.name.toLowerCase().includes(q.toLowerCase())}
      label="Car Model"
      getOptionValue={(model) => model.id}
      renderOption={(model) => (
        <p>
          {model.name}
          {model.manufacture_year && (
            <span className="text-muted-foreground">
              {" "}
              ({model.manufacture_year})
            </span>
          )}
        </p>
      )}
    />
  )
}

export function CarModelPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  carBrandId,
  ...props
}: FormAutoCompleteProps<TFieldValues, CarModel> & {
  carBrandId?: EntityId | null
}) {
  //   const [query, setQuery] = useState("")
  const { data, isLoading } = useVehicleConfigurationsQuery()
  const [models, setModels] = useState<CarModel[]>([])

  useEffect(() => {
    let brandModels = data?.car_models ?? []
    if (carBrandId) {
      brandModels = brandModels?.filter(
        (model) => model.car_brand_id === carBrandId
      )
    }
    setModels(brandModels)
  }, [carBrandId, data])

  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={models}
      control={control}
      label={label}
      remote={remote}
      //   onSearch={(q) => setQuery(q)}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderOption={(model) => (
        <p>
          {model.name}
          {model.manufacture_year && (
            <span className="text-muted-foreground">
              {" "}
              ({model.manufacture_year})
            </span>
          )}
        </p>
      )}
      onSelected={onSelected}
      {...props}
    />
  )
}
