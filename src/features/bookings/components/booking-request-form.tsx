"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  AutoCompleteField,
  HiddenField,
  NumberField,
  TextField,
  DiscountField,
  MoneyField,
  DateTimePickerField,
} from "@/components/ui/form-fields";
import { getCustomersByQuery } from "@/features/clients/service";
import { getServicesByQuery } from "@/features/services/service";
import { useTranslation } from "@/i18n";
import React, { Activity, useMemo, useState } from "react";
import z from "zod";
import { BookingCreateSchema } from "@/features/bookings/schemas";
import { toast } from "sonner";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ListIcon, Trash2Icon } from "lucide-react";
import { createBooking } from "@/features/bookings/services";
import { AutoComplete } from "@/components/ui/autocomplete";
import { Service } from "@/features/services/types";
import { formatPrice } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitButton } from "@/components/ui/submit-button";

type BookingRequestFormProps = {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getServicesByQuery>>,
      Awaited<ReturnType<typeof getCustomersByQuery>>,
    ]
  >;
};

export function BookingRequestForm({ promises }: BookingRequestFormProps) {
  const tr = useTranslation();
  const [activeServiceTab, setActiveServiceTab] = useState<
    string | undefined
  >();
  const [serviceView, setServiceView] = useState<"list" | "single">("list");

  const { control, handleSubmit, formState, watch } = useForm<
    z.infer<typeof BookingCreateSchema>
  >({
    resolver: zodResolver(BookingCreateSchema),
    defaultValues: {
      services: [],
    },
    mode: "onChange",
  });

  const { fields, remove, prepend } = useFieldArray({
    control,
    name: "services",
  });

  const [{ data: services }, { data: passengers }] = React.use(promises);

  async function onSubmit(values: z.infer<typeof BookingCreateSchema>) {
    const { isSuccess, error } = await createBooking(values);
    if (isSuccess) {
      toast.success(`${tr("trips.trip_created_successfully")}`);
    } else {
      toast.error(error!.message);
    }
  }

  const watchedServiceItems = useWatch({
    control,
    name: "services",
    defaultValue: [],
  });

  const partialAmount = watch("partial");
  const discount = watch("discount");

  const calculatedServicesTotals = useMemo(() => {
    return watchedServiceItems.map((item) => {
      const qty = item.total_items || 0;
      const price = Number(item.cost_per_item) || 0;
      const discount = item.discount || 0;

      const subtotalBeforeDiscount = qty * price;
      const discountAmount = subtotalBeforeDiscount * (discount / 100);
      const lineTotal = subtotalBeforeDiscount - discountAmount;

      return {
        ...item,
        lineTotal: Math.round(lineTotal * 100) / 100, // 2 decimal places
      };
    });
  }, [watchedServiceItems]);

  const grandTotal = useMemo(() => {
    return calculatedServicesTotals.reduce(
      (sum, item) => sum + (item.lineTotal || 0),
      0,
    );
  }, [calculatedServicesTotals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr("new_booking")}</CardTitle>
        <CardDescription>{tr("create_booking_help")}</CardDescription>
        <CardAction>
          <CardTitle>
            {formatPrice(grandTotal, { showZeroAsNumber: true })}
          </CardTitle>
        </CardAction>
      </CardHeader>
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log(errors);
        })}
      >
        <CardContent className="grid gap-5 grid-cols-1 md:grid-cols-2 pb-5">
          <Card>
            <CardContent>
              <FieldGroup className="pb-5">
                <AutoCompleteField
                  label={tr("client")}
                  name={"customer_id"}
                  control={control}
                  options={passengers.map((ele) => ({
                    label: ele.fullname,
                    value: ele.id,
                  }))}
                />
                <DateTimePickerField
                  label={"Pickup Date"}
                  name={"pickup_time"}
                  control={control}
                />
                <DateTimePickerField
                  label={"Return Date"}
                  name={"return_time"}
                  control={control}
                />
                <NumberField
                  label={"Initial Payment"}
                  name={"partial"}
                  control={control}
                  required={false}
                />
                <DiscountField
                  label={"Discount"}
                  name={"discount"}
                  control={control}
                  required={false}
                />
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <FieldGroup className="pb-5">
                <div className="flex flex-row gap-2">
                  <AutoComplete<Service>
                    triggerClassName="flex-1"
                    fetcher={async (_) => {
                      return services;
                    }}
                    renderOption={(service) => (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="font-medium">{service.name}</div>
                        </div>
                      </div>
                    )}
                    getOptionValue={(service) => service.id.toString()}
                    getDisplayValue={(service) => (
                      <div className="flex items-center gap-2 text-left">
                        <div className="flex flex-col leading-tight">
                          <div className="font-medium">{service.name}</div>
                        </div>
                      </div>
                    )}
                    notFound={
                      <div className="py-6 text-center text-sm">
                        No Services found
                      </div>
                    }
                    label="Service"
                    placeholder="Search service..."
                    value={undefined}
                    onChange={async (service) => {
                      if (service)
                        prepend({
                          service_id: service.id,
                          service_name: service.name,
                          cost_per_item: service.booking_fee.toString(),
                          total_items: 1,
                          discount: 0,
                        });
                      setActiveServiceTab(`services.0`);
                    }}
                  />
                  <Button
                    size="icon"
                    type="button"
                    variant={"secondary"}
                    onClick={() => {
                      setServiceView((prev) =>
                        prev === "list" ? "single" : "list",
                      );
                    }}
                  >
                    <ListIcon />
                  </Button>
                </div>
                <Activity
                  mode={
                    fields.length > 0 && serviceView === "single"
                      ? "visible"
                      : "hidden"
                  }
                >
                  <Tabs
                    value={activeServiceTab}
                    onValueChange={(val) => {
                      setActiveServiceTab(val);
                    }}
                  >
                    <TabsList>
                      {fields.map((service, index) => (
                        <TabsTrigger
                          key={`services.${index}`}
                          value={`services.${index}`}
                        >
                          {service.service_name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {fields.map((service, index) => {
                      const serviceWithTotal = calculatedServicesTotals[index];
                      return (
                        <TabsContent
                          key={`services.${index}`}
                          value={`services.${index}`}
                        >
                          <Card>
                            <CardHeader>
                              <CardAction>
                                <Button
                                  type="button"
                                  variant={"destructive"}
                                  size={"icon-sm"}
                                  onClick={() => {
                                    remove(index);
                                    setActiveServiceTab("services.0");
                                  }}
                                >
                                  <Trash2Icon />
                                </Button>
                              </CardAction>
                            </CardHeader>
                            <CardContent
                              key={service.id}
                              className="grid grid-cols-1 gap-2"
                            >
                              <HiddenField
                                name={`services.${index}.service_id`}
                                control={control}
                              />
                              <TextField
                                label={"Service"}
                                name={`services.${index}.service_name`}
                                control={control}
                              />
                              <TextField
                                label={"Cost"}
                                name={`services.${index}.cost_per_item`}
                                control={control}
                              />
                              <div className="grid grid-flow-col gap-4">
                                <NumberField
                                  label={"Units"}
                                  name={`services.${index}.total_items`}
                                  control={control}
                                />
                                <NumberField
                                  required={false}
                                  label={"Discount"}
                                  name={`services.${index}.discount`}
                                  control={control}
                                />
                              </div>
                            </CardContent>
                            <CardFooter>
                              Total:{" "}
                              {formatPrice(serviceWithTotal?.lineTotal, {
                                showZeroAsNumber: true,
                              })}
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </Activity>
                <Activity mode={serviceView === "list" ? "visible" : "hidden"}>
                  {fields.map((service, index) => {
                    const serviceWithTotal = calculatedServicesTotals[index];
                    return (
                      <Card key={`${service.id}*${index}`}>
                        <CardContent
                          key={`${service.id}-${index}`}
                          className="grid grid-cols-1 gap-2"
                        >
                          <HiddenField
                            name={`services.${index}.service_id`}
                            control={control}
                          />
                          <TextField
                            label={"Service"}
                            name={`services.${index}.service_name`}
                            control={control}
                          />
                          <TextField
                            label={"Cost"}
                            name={`services.${index}.cost_per_item`}
                            control={control}
                          />
                          <div className="grid grid-flow-col gap-4">
                            <NumberField
                              label={"Units"}
                              name={`services.${index}.total_items`}
                              control={control}
                            />
                            <NumberField
                              required={false}
                              label={"Discount"}
                              name={`services.${index}.discount`}
                              control={control}
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          Total:{" "}
                          {formatPrice(serviceWithTotal?.lineTotal, {
                            showZeroAsNumber: true,
                          })}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </Activity>
              </FieldGroup>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter>
          <SubmitButton
            text={tr("common.form.submit")}
            isSubmitting={formState.isSubmitting}
            disabled={fields.length === 0}
          />
        </CardFooter>
      </form>
    </Card>
  );
}
