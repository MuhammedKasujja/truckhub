import React from "react";
import { EntityId } from "@/types";
import {
  VehicleCreateSchema,
  VehicleUpdateSchema,
} from "@/features/vehicles/schemas";
import z from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVehicle, updateVehicle } from "@/features/vehicles/service";
import { CarModel, DriveTrain, VehicleConfigurations } from "@/types/setting";

export function useVehicleForm(
  vehicleCofig: VehicleConfigurations | undefined,
  initialData?: z.infer<typeof VehicleUpdateSchema>,
) {
  const [vehicleType, setVehicleType] = React.useState<
    | {
        name: string;
        is_truck: boolean;
        id: EntityId;
      }
    | undefined
  >();

  const [driveTrains, setDriveTrains] = React.useState<DriveTrain[]>(
    vehicleCofig?.drive_trains ?? [],
  );

  const [carModels, setCarModels] = React.useState<CarModel[]>(
    vehicleCofig?.car_models ?? [],
  );

  const isEdit = !!initialData;

  const formSchema = isEdit ? VehicleUpdateSchema : VehicleCreateSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const selectedCarBrandId = form.watch("car_brand_id");
  const selectedCarModelId = form.watch("car_model_id");

  //  Track vehicle type when car model changes to populate drive trains for small cars and trucks
  React.useEffect(() => {
    const vehicleType = vehicleCofig?.vehicle_types.find((ele) =>
      carModels.find((model) => model.vehicle_type_id === ele.id),
    );
    form.setValue("vehicle_type_id", Number(vehicleType?.id));
    setVehicleType(vehicleType);
    setDriveTrains(
      vehicleCofig?.drive_trains.filter(
        (ele) => ele.is_truck === vehicleType?.is_truck,
      ) ?? [],
    );
    // form.reset({ drive_train_id: undefined, tonnage_id: undefined });
  }, [vehicleCofig, selectedCarModelId]);

  //  Populate car models basing on selected car make
  React.useEffect(() => {
    const carBrand = vehicleCofig?.car_brands.find(
      (ele) => ele.id === selectedCarBrandId,
    );
    setCarModels(
      vehicleCofig?.car_models.filter(
        (ele) => ele.car_brand_id === carBrand?.id,
      ) ?? [],
    );
  }, [selectedCarBrandId, vehicleCofig]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values ? updateVehicle(values) : createVehicle(values);

    const { isSuccess, error, message } = await promise;
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(error?.message);
    }
  }

  function handleSubmit() {
    form.handleSubmit(onSubmit, (errors) => {
      console.log(errors);
    });
  }

  return {
    onSubmit,
    form,
    isEdit,
    truckTonnages: vehicleCofig?.truck_tonnages ?? [],
    driveTrains,
    carModels,
    carBrands: vehicleCofig?.car_brands,
    vehicleType,
  };
}
