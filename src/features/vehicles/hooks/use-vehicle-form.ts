import React from "react"
import { EntityId } from "@/schemas"
import {
  VehicleCreateSchema,
  VehicleUpdateSchema,
} from "@/features/vehicles/schemas"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CarModel, DriveTrain, VehicleConfigurations } from "@/types/setting"

export function useVehicleForm(
  vehicleCofig: VehicleConfigurations | undefined,
  initialData?: z.infer<typeof VehicleUpdateSchema>
) {
  const [vehicleType, setVehicleType] = React.useState<
    | {
        name: string
        is_truck: boolean
        id: EntityId
      }
    | undefined
  >()

  const [driveTrains, setDriveTrains] = React.useState<DriveTrain[]>(
    vehicleCofig?.drive_trains ?? []
  )

  const [carModels, setCarModels] = React.useState<CarModel[]>(
    vehicleCofig?.car_models ?? []
  )

  const isEdit = !!initialData

  const formSchema = isEdit ? VehicleUpdateSchema : VehicleCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData, features: initialData?.features ?? [] },
  })

  const selectedCarBrandId = form.watch("car_brand_id")
  const selectedCarModelId = form.watch("car_model_id")

  //  Track vehicle type when car model changes to populate drive trains for small cars and trucks
  React.useEffect(() => {
    const vehicleType = vehicleCofig?.vehicle_types.find((ele) =>
      carModels.find((model) => model.vehicle_type_id === ele.id)
    )
    form.setValue("vehicle_type_id", vehicleType?.id)
    setVehicleType(vehicleType)
    setDriveTrains(
      vehicleCofig?.drive_trains.filter(
        (ele) => ele.is_truck === vehicleType?.is_truck
      ) ?? []
    )
    // form.reset({ drive_train_id: undefined, tonnage_id: undefined });
  }, [vehicleCofig, selectedCarModelId])

  //  Populate car models basing on selected car make
  React.useEffect(() => {
    const carBrand = vehicleCofig?.car_brands.find(
      (ele) => ele.id === selectedCarBrandId
    )
    setCarModels(
      vehicleCofig?.car_models.filter(
        (ele) => ele.car_brand_id === carBrand?.id
      ) ?? []
    )
  }, [selectedCarBrandId, vehicleCofig])

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
    selectedFeatures:features,
    truckTonnages: vehicleCofig?.truck_tonnages ?? [],
    driveTrains,
    carModels,
    carBrands: vehicleCofig?.car_brands,
    vehicleType,
    toggleFeatures,
  }
}
