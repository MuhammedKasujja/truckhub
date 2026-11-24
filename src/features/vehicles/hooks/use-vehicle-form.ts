import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type z from "zod"
import type { VehicleConfigurations } from "@/types/setting"
import {
  VehicleCreateSchema,
  VehicleUpdateSchema,
} from "@/features/vehicles/schemas"

export function useVehicleForm(
  vehicleCofig: VehicleConfigurations | undefined,
  initialData?: z.infer<typeof VehicleUpdateSchema>
) {
  const isEdit = !!initialData

  const formSchema = isEdit ? VehicleUpdateSchema : VehicleCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData, features: initialData?.features ?? [] },
    reValidateMode: "onChange",
  })

  const selectedCarBrandId = form.watch("car_brand_id")
  const selectedCarModelId = form.watch("car_model_id")

  // Models of the selected brand
  const carModels = React.useMemo(
    () =>
      vehicleCofig?.car_models.filter(
        (model) => model.car_brand_id === selectedCarBrandId
      ) ?? [],
    [vehicleCofig, selectedCarBrandId]
  )

  // The category (car, truck, …) comes from the selected model
  const vehicleCategory = React.useMemo(() => {
    const model = vehicleCofig?.car_models.find(
      (m) => m.id === selectedCarModelId
    )
    return vehicleCofig?.vehicle_types.find(
      (type) => type.id === model?.vehicle_category_id
    )
  }, [vehicleCofig, selectedCarModelId])

  const isTruck = !!vehicleCategory?.is_truck

  React.useEffect(() => {
    form.setValue("vehicle_category_id", vehicleCategory?.id)
    // Drop truck-only values so they are not sent for other vehicles
    if (!isTruck) {
      if (form.getValues("second_plate_number"))
        form.setValue("second_plate_number", null)
      if (form.getValues("tonnage_capacity"))
        form.setValue("tonnage_capacity", null)
    }
  }, [vehicleCategory?.id, isTruck])

  const features = form.watch("features")

  const toggleFeatures = (featureId: string, checked: boolean) => {
    const activeFeatures = features ?? []
    form.setValue(
      "features",
      checked
        ? [...activeFeatures, featureId]
        : activeFeatures.filter((f) => f !== featureId)
    )
  }

  return {
    form,
    isEdit,
    formSchema,
    selectedFeatures: features,
    truckTonnages: vehicleCofig?.truck_tonnages ?? [],
    driveTrains: vehicleCofig?.drive_trains ?? [],
    carModels,
    carBrands: vehicleCofig?.car_brands,
    vehicleCategory,
    toggleFeatures,
  }
}
