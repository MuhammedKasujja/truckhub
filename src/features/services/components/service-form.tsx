import { Field, FieldGroup } from "@/components/ui/field"
import {
  AutoCompleteField,
  MoneyField,
  NumberField,
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
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import { CarBrandPickerField } from "@/features/settings/car-brand/components"
import { CarModelPickerField } from "@/features/settings/car-model/components"
import { BaseFormProps } from "@/common/types"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

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

  const defaultDerivedValues = useMemo(() => {
    const target = (
      defaultValues?.vehicle_category_id ? "category" : "model"
    ) as const
    return defaultValues
      ? { ...defaultValues, target: target }
      : { target: target }
  }, [defaultValues])

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultDerivedValues,
  })

  const target = form.watch("target")

  async function handleSubmit(values: Values) {
    if (mode === "edit") {
      onSubmit(ServiceUpdateSchema.parse(values))
    } else {
      onSubmit(ServiceCreateSchema.parse(values))
    }
  }

  return (
    <form
      id="service-form"
      onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.log(errors)
      })}
    >
      <p className="pb-2">Select a pricing rule</p>
      <div className="@container">
        <Field orientation={"horizontal"} className="pb-5">
          <Item
            variant={"outline"}
            className={cn(
              "cursor-pointer",
              target === "model" && "bg-primary/5 dark:bg-primary/10"
            )}
            onClick={() => {
              form.setValue("target", "model")
            }}
          >
            <ItemContent>
              <ItemTitle>A Car Model</ItemTitle>
              <ItemDescription>e.g. Toyota Hillux</ItemDescription>
            </ItemContent>
          </Item>
          <Item
            variant={"outline"}
            className={cn(
              "cursor-pointer",
              target === "category" && "bg-primary/5 dark:bg-primary/10"
            )}
            onClick={() => {
              form.setValue("target", "category")
            }}
          >
            <ItemContent>
              <ItemTitle>A Category</ItemTitle>
              <ItemDescription>e.g. any Sedan</ItemDescription>
            </ItemContent>
          </Item>
        </Field>
      </div>
      <div className="@container pb-6">
        <FieldGroup className="grid grid-flow-row grid-cols-1 @md:grid-cols-2">
          {target === "category" && (
            <AutoCompleteField
              label={tr("common.vehicleCaterory")}
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
          )}
          {target === "model" && (
            <>
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
            </>
          )}
          <TextField
            label={tr("common.form.serviceName")}
            name={"name"}
            control={form.control}
          />

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
          />
          <MoneyField
            label={tr("services.last_price")}
            name={"min_fare"}
            control={form.control}
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
        </FieldGroup>
      </div>
    </form>
  )
}
