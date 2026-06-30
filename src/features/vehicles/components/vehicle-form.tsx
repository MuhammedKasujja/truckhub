"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import {
  AutoCompleteField,
  ColorPickerField,
  NumberField,
  SelectField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  VehicleCreateSchema,
  VehicleUpdateSchema,
} from "@/features/vehicles/schemas"
import { createVehicleFn, updateVehicleFn } from "@/features/vehicles/services"
import { EngineTypes, Gearboxes } from "@/features/vehicles/types"
import { toast } from "sonner"
import z from "zod"
import { VehicleCylinderList } from "@/config/constants"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useVehicleForm } from "../hooks/use-vehicle-form"
import { useVehicleConfigurationsSuspense } from "@/features/settings/hooks/use-vehicle-configurations"
import { CAR_COLOR_OPTIONS } from "@/common/config"
import { VehicleFeature } from "@/types/setting"
import { useState } from "react"
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import React from "react"
import { Button } from "@/components/ui/button"

type VehicleFormProps = {
  initialData?: z.infer<typeof VehicleUpdateSchema>
}

const steps = [
  {
    value: "details",
    title: "Vehicle Details",
    description: "Enter car information",
    fields: Object.keys(VehicleCreateSchema.shape) as Array<
      keyof z.infer<typeof VehicleCreateSchema>
    >,
  },
  {
    value: "features",
    title: "Features",
    description: "Select car added-on features",
    fields: ["features"] as const,
  },
]

export function VehicleForm({ initialData }: VehicleFormProps) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()
  const { data: vehicleCofig } = useVehicleConfigurationsSuspense()
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
  const [step, setStep] = useState("details")

  const stepIndex = steps.findIndex((s) => s.value === step)

  const onValidate: NonNullable<StepperProps["onValidate"]> = React.useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true

      const stepData = steps.find((s) => s.value === step)
      if (!stepData) return true

      const isValid = await form.trigger(stepData.fields)

      if (!isValid) {
        toast.info("Please complete all required fields to continue")
      }

      return isValid
    },
    [form, step]
  )

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
    <form
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log(errors)
      })}
    >
      <Stepper value={step} onValueChange={setStep} onValidate={onValidate}>
        <StepperList>
          {steps.map((step) => (
            <StepperItem key={step.value} value={step.value}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col gap-px">
                  <StepperTitle>{step.title}</StepperTitle>
                  <StepperDescription>{step.description}</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator className="mx-4" />
            </StepperItem>
          ))}
        </StepperList>
        <StepperContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>
                {isEdit ? tr("edit_vehicle") : tr("new_vehicle")}
              </CardTitle>
              <CardDescription>{tr("create_new_vehicle")}</CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              <div className="grid grid-cols-1 gap-5 pb-6 md:grid-cols-2">
                <FieldGroup>
                  <TextField
                    label={tr("plate_number")}
                    name={"plate_number"}
                    control={form.control}
                  />
                  <Field
                    className="grid md:grid-cols-2"
                    orientation={"horizontal"}
                  >
                    <ColorPickerField
                      label={tr("color")}
                      name={"color"}
                      required
                      control={form.control}
                      options={CAR_COLOR_OPTIONS}
                    />
                    <ColorPickerField
                      label={tr("interior_color")}
                      name={"interior_color"}
                      control={form.control}
                      required={false}
                      options={CAR_COLOR_OPTIONS}
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
                    </div>
                  )}
                </FieldGroup>
              </div>
              <Separator />
            </CardContent>
          </Card>
        </StepperContent>
        <StepperContent value="features">
          <Card>
            <CardContent>
              <VehicleFeaturesForm
                features={vehicleCofig?.features}
                selectedFeatures={selectedFeatures}
                toggleFeatures={toggleFeatures}
              />
            </CardContent>
          </Card>
        </StepperContent>
        <div className="mt-4 flex justify-between">
            <StepperPrev asChild>
              <Button variant="outline">Previous</Button>
            </StepperPrev>
            <div className="text-muted-foreground text-sm">
              Step {stepIndex + 1} of {steps.length}
            </div>
            {stepIndex === steps.length - 1 ? (
              <SubmitButton
                text={tr("common.form.submit")}
                isSubmitting={form.formState.isSubmitting}
              />
            ) : (
              <StepperNext asChild>
                <Button>Next</Button>
              </StepperNext>
            )}
          </div>
      </Stepper>
    </form>
  )
}

type VehicleFeaturesFormProps = {
  features: VehicleFeature[] | undefined
  selectedFeatures: string[] | undefined
  toggleFeatures: (featureId: string, checked: boolean) => void
}

function VehicleFeaturesForm({
  features,
  selectedFeatures,
  toggleFeatures,
}: VehicleFeaturesFormProps) {
  return (
    <FieldSet className="mt-4">
      <FieldLegend className="my-4" variant="label">
        Vehicle Added on Features
      </FieldLegend>
      <FieldGroup className="gap-5">
        {features?.map((feat) => (
          <Field key={feat.id} orientation="horizontal" className="capitalize">
            <Checkbox
              id={feat.id}
              name={feat.id}
              checked={selectedFeatures?.includes(feat.id)}
              onCheckedChange={(state: boolean) =>
                toggleFeatures(feat.id, state)
              }
            />
            <Label htmlFor={feat.id}>{feat.name}</Label>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  )
}
