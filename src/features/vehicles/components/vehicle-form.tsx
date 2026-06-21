"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import {
  AutoCompleteField,
  NumberField,
  SelectField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import { VehicleUpdateSchema } from "@/features/vehicles/schemas"
import { createVehicleFn, updateVehicleFn } from "@/features/vehicles/services"
import { EngineTypes, Gearboxes } from "@/features/vehicles/types"
import { toast } from "sonner"
import z from "zod"
import { VehicleCylinderList } from "@/config/constants"
import { SubmitButton } from "@/components/ui/submit-button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createVehicleConfigurationsQueryOptions } from "@/features/settings/query-options"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useVehicleForm } from "../hooks/use-vehicle-form"

type VehicleFormProps = {
  initialData?: z.infer<typeof VehicleUpdateSchema>
}

export function VehicleForm({ initialData }: VehicleFormProps) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()
  const {
    data: { data: vehicleCofig },
  } = useSuspenseQuery(createVehicleConfigurationsQueryOptions())
  const {
    formSchema,
    form,
    vehicleType,
    toggleFeatures,
    driveTrains,
    selectedFeatures,
    isEdit,
    carModels,
  } = useVehicleForm(vehicleCofig, initialData)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateVehicleFn({ data: values })
        : createVehicleFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.vehicles.list.invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? tr("edit_vehicle") : tr("new_vehicle")}</CardTitle>
        <CardDescription>{tr("create_new_vehicle")}</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log(errors)
        })}
      >
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 gap-5 pb-6 md:grid-cols-2">
            <FieldGroup>
              <TextField
                label={tr("plate_number")}
                name={"plate_number"}
                control={form.control}
              />
              <Field className="" orientation={"horizontal"}>
                <TextField
                  label={tr("color")}
                  name={"color"}
                  control={form.control}
                />
                <TextField
                  label={tr("interior_color")}
                  name={"interior_color"}
                  control={form.control}
                  required={false}
                />
              </Field>
              <Field className="" orientation={"horizontal"}>
                <TextField
                  label={tr("common.year")}
                  name={"year"}
                  control={form.control}
                />
                <SelectField
                  label={tr("cylinders")}
                  control={form.control}
                  name={"cylinders"}
                  placeholder="Select cylinder"
                  options={VehicleCylinderList.map((opt) => ({
                    label: `${opt}`,
                    value: `${opt}`,
                  }))}
                />
              </Field>
              <NumberField
                label={tr("tank_capacity")}
                name={"tank_capacity"}
                control={form.control}
              />
              <NumberField
                label={tr("number_of_axles")}
                name={"total_axles"}
                control={form.control}
              />
              <NumberField
                label={"Consumption Rate"}
                name={"consumption_rate"}
                control={form.control}
              />
              <NumberField
                label={tr("services.seats")}
                name={"seats"}
                control={form.control}
                required={false}
              />
            </FieldGroup>
            <FieldGroup>
              <SelectField
                label={tr("fuel_type")}
                control={form.control}
                name={"engine_type"}
                placeholder="Select fuel type"
                options={EngineTypes.map((opt) => ({
                  label: tr(`common.${opt}`),
                  value: opt,
                }))}
              />
              <SelectField
                label={tr("gearbox")}
                control={form.control}
                name={"gearbox"}
                placeholder="Select gearbox"
                options={Gearboxes.map((opt) => ({
                  label: tr(`common.${opt}`),
                  value: opt,
                }))}
              />
              <AutoCompleteField
                label={tr("common.car_brand")}
                control={form.control}
                name={"car_brand_id"}
                placeholder="Select Car Brand"
                emptyPlaceholder="No Car Brand found"
                options={
                  vehicleCofig?.car_brands.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  })) ?? []
                }
              />
              <AutoCompleteField
                disabled={!form.watch("car_brand_id")}
                label={tr("common.car_model")}
                control={form.control}
                name={"car_model_id"}
                placeholder="Select Car Mode"
                emptyPlaceholder="No Car Model found"
                options={
                  carModels.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  })) ?? []
                }
              />
              <AutoCompleteField
                disabled={!vehicleType}
                label={tr("common.drive_train")}
                control={form.control}
                name={"drive_train_id"}
                placeholder="Select Car Drive Train"
                emptyPlaceholder="No Car Drive Train found"
                options={
                  driveTrains.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  })) ?? []
                }
              />
              {vehicleType?.is_truck && (
                <div className="space-y-4">
                  <NumberField
                    label={"Tonnage Capacity"}
                    name={"tonnage_capacity"}
                    control={form.control}
                    required={false}
                  />
                  <TextField
                    label={tr("interior_color")}
                    name={"second_plate_number"}
                    control={form.control}
                    required={false}
                  />
                  {/* <AutoCompleteField
                    label={tr("common.tonnage")}
                    control={form.control}
                    name={"tonnage_id"}
                    placeholder="Select Truck tonnage"
                    emptyPlaceholder="No Truck tonnage found"
                    options={
                      vehicleCofig?.truck_tonnages.map((opt) => ({
                        label: `${opt.tonnage_min} - ${opt.tonnage_max}`,
                        value: opt.id,
                      })) ?? []
                    }
                  /> */}
                </div>
              )}
            </FieldGroup>
          </div>
          <Separator />
          <FieldSet className="mt-4">
            <FieldLegend className="my-4" variant="label">
              Vehicle Added on Features
            </FieldLegend>
            <FieldGroup className="gap-5">
              {vehicleCofig?.features.map((feat) => (
                <Field
                  key={feat.id}
                  orientation="horizontal"
                  className="capitalize"
                >
                  <Checkbox
                    id={feat.id}
                    name={feat.id}
                    checked={selectedFeatures?.includes(feat.id)}
                    onCheckedChange={(state) => toggleFeatures(feat.id, state)}
                  />
                  <Label htmlFor={feat.id}>{feat.name}</Label>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter>
          <SubmitButton
            text={tr("common.form.submit")}
            isSubmitting={form.formState.isSubmitting}
          />
        </CardFooter>
      </form>
    </Card>
  )
}
