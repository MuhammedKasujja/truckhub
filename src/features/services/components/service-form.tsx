"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  AutoCompleteField,
  MoneyField,
  NumberField,
  TextareaField,
  TextField,
  YearPickerField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  ServiceCreateSchema,
  ServiceCreateSchemaInput,
  ServiceUpdateSchema,
  ServiceUpdateSchemaInput,
} from "@/features/services/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import { CarBrandPickerField } from "@/features/settings/car-brand/components"
import { CarModelPickerField } from "@/features/settings/car-model/components"
import { BaseFormProps } from "@/common/types"

type ServiceFormProps = BaseFormProps<
  ServiceCreateSchemaInput,
  ServiceUpdateSchemaInput
>

export function ServiceForm({
  defaultValues,
  mode,
  onSubmit,
}: ServiceFormProps) {
  const tr = useTranslation()
  const { data } = useVehicleConfigurations()

  const isEdit = mode === "edit"

  const formSchema = isEdit ? ServiceUpdateSchema : ServiceCreateSchema

  type Values = z.infer<typeof formSchema>

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  async function handleSubmit(values: Values) {
    if (mode === "edit") {
      onSubmit(ServiceUpdateSchema.parse(values))
    } else {
      onSubmit(ServiceCreateSchema.parse(values))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? tr("services.edit_service") : tr("services.new_service")}
        </CardTitle>
        <CardDescription>{tr("services.create_new_service")}</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.log(errors, mode, isEdit, formSchema)
        })}
      >
        <CardContent className="pb-6">
          <FieldGroup className="grid grid-flow-row grid-cols-1 md:grid-cols-2">
            <AutoCompleteField
              label={tr("common.vehicle_type")}
              control={form.control}
              name={"vehicle_category_id"}
              placeholder="Select Vehicle"
              emptyPlaceholder="No vehicles found"
              options={
                data?.vehicle_types.map((opt) => ({
                  label: opt.name,
                  value: opt.id,
                })) ?? []
              }
            />
            <TextField
              label={tr("common.form.serviceName")}
              name={"name"}
              control={form.control}
            />
            {/* <TextField
              label={tr("common.display_name")}
              name={"display_name"}
              control={form.control}
            /> */}
            <Field orientation={"horizontal"}>
              <YearPickerField
                label={"Start Year"}
                name={"start_year"}
                control={form.control}
              />
            </Field>
            <NumberField
              label={tr("services.seating_capacity")}
              name={"seats"}
              control={form.control}
              required={false}
            />
            <MoneyField
              label={tr("services.price")}
              name={"base_fare"}
              control={form.control}
              required={false}
            />
            <MoneyField
              label={tr("services.last_price")}
              name={"min_fare"}
              control={form.control}
              required={false}
            />
            {/* <MoneyField
              label={tr("services.price_per_min")}
              name={"price_per_min"}
              control={form.control}
            />
            <MoneyField
              label={tr("services.price_per_unit_distance")}
              name={"price_per_unit_distance"}
              control={form.control}
            /> */}
            {/* <NumberField
              label={tr("services.booking_fee")}
              name={"booking_fee"}
              control={form.control}
              required={false}
            /> */}
            <CarBrandPickerField
              label={tr("services.car_brand")}
              name={"car_brand_id"}
              control={form.control}
            />
            <CarModelPickerField
              disabled={form.watch("car_brand_id") == undefined}
              label={tr("services.car_model")}
              name={"car_model_id"}
              carBrandId={form.watch("car_brand_id")}
              control={form.control}
            />
            <TextareaField
              label={tr("common.form.description")}
              name={"description"}
              control={form.control}
              required={false}
            />
          </FieldGroup>
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
