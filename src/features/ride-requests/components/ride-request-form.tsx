"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import {
  AutoCompleteField,
  DateTimePickerField,
  NumberField,
  SwitchField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import React from "react"
import { LocationAutoComplete } from "@/components/location-autocomplete"
import { formatDistance, formatDuration, formatPrice } from "@/lib/format"
import {
  Map,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
  type MapRef,
} from "@/components/ui/map"
import polyline from "@mapbox/polyline"
import { SubmitButton } from "@/components/ui/submit-button"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRideForm } from "../hooks/use-ride-form"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { servicesSearchQueryOptions } from "@/features/services/query-options"
import { RideRequestUpdateSchemaType } from "../schemas"

type RideRequestFormProps = {
  initialData?: RideRequestUpdateSchemaType
}

export function RideRequestForm({ initialData }: RideRequestFormProps) {
  const {
    data: { data: serviceList },
  } = useSuspenseQuery(servicesSearchQueryOptions())

  const { data: clientsResponse } = useQuery(clientsSearchQueryOptions())
  const mapRef = React.useRef<MapRef>(null)

  const tr = useTranslation()

  const {
    service,
    form,
    checkpoints,
    locationDistanceTime,
    onPickupChanged,
    appendCheckpoint,
    onDestinationChanged,
    onSubmit,
  } = useRideForm(serviceList, initialData)

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{tr("trips.new_trip")}</CardTitle>
          <CardDescription>{tr("trips.create_trip_help")}</CardDescription>
        </CardHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log(errors)
          })}
        >
          <CardContent>
            <FieldGroup className="pb-6">
              <AutoCompleteField
                label={tr("common.passenger")}
                name={"customer_id"}
                control={form.control}
                options={(clientsResponse?.data ?? []).map((ele) => ({
                  label: ele.fullname,
                  value: ele.id,
                }))}
              />
              {/* <SearchAutoCompleteField<
                Customer,
                z.infer<typeof RideRequestCreateSchema>
              >
                control={form.control}
                label={tr("common.passenger")}
                name={"customer_id"}
                fetcher={async (_) => {
                  return passengers;
                }}
                renderOption={(customer) => (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="font-medium">{customer.fullname}</div>
                    </div>
                  </div>
                )}
                getOptionValue={(customer) => customer.id.toString()}
                getDisplayValue={(customer) => (
                  <div className="flex items-center gap-2 text-left">
                    <div className="flex flex-col leading-tight">
                      <div className="font-medium">{customer.fullname}</div>
                    </div>
                  </div>
                )}
                notFound={
                  <div className="py-6 text-center text-sm">
                    No Customers found
                  </div>
                }
                placeholder="Search customer..."
              /> */}
              <div className="flex flex-row gap-5">
                <NumberField
                  label={"Partial"}
                  name={"partial"}
                  control={form.control}
                  required={false}
                />
                <NumberField
                  label={"Discount"}
                  name={"discount"}
                  control={form.control}
                  required={false}
                />
              </div>
              <DateTimePickerField
                label={"Start time"}
                name={"request_start_time"}
                control={form.control}
              />
              <SwitchField
                label="Needs Loaders"
                control={form.control}
                name={"requires_loaders"}
                description="Indicates client needs off-loaders"
              />
              <SwitchField
                label="Needs Fuel"
                control={form.control}
                name={"requires_fuel"}
                description="Vehicle must be fueled"
              />

              <TextField
                label={tr("common.driver")}
                name={"driver_id"}
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
      <Card>
        <CardContent>
          <FieldGroup className="pb-2">
            <AutoCompleteField
              label={tr("common.service")}
              name={"service_id"}
              control={form.control}
              options={serviceList.map((ele) => ({
                label: ele.name,
                value: ele.id,
              }))}
            />
            <LocationAutoComplete
              label="Pickup"
              onPlaceLoaded={onPickupChanged}
            />
            {checkpoints.map((checkpoint) => (
              <div key={checkpoint.distance}>
                <div>{checkpoint.name}</div>
              </div>
            ))}
            <div className="flex items-end gap-4">
              <LocationAutoComplete
                label="Destination"
                onPlaceLoaded={async (place) => {
                  await onDestinationChanged(place)
                }}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} onClick={appendCheckpoint}>
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add checkpoint</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {locationDistanceTime && service && (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-flow-col">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-light">
                        Estimated price
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold">
                      {formatPrice(
                        parseFloat(locationDistanceTime.estimated_cost)
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-light">
                        Distance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold">
                      {formatDistance(locationDistanceTime.distance)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-light">Time</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold">
                      {formatDuration(locationDistanceTime.duration)}
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="space-y-2">
                    <div className="h-96 w-full">
                      <Map
                        ref={mapRef}
                        center={[
                          form.getValues("pickup_location")!.lng,
                          form.getValues("pickup_location")!.lat,
                        ]}
                        zoom={11.0}
                        styles={{
                          light: "https://tiles.openfreemap.org/styles/bright",
                        }}
                      >
                        <MapRoute
                          coordinates={polyline
                            .decode(locationDistanceTime.polyline)
                            .map(([lat, lng]) => [lng, lat])}
                          color="#3b82f6"
                          width={5}
                          opacity={1}
                        />
                        {[
                          form.getValues("pickup_location")!,
                          form.getValues("destination_location")!,
                        ].map((stop, index) => (
                          <MapMarker
                            key={stop.name}
                            longitude={stop.lng}
                            latitude={stop.lat}
                          >
                            <MarkerContent>
                              <div className="flex size-4.5 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-white shadow-lg">
                                {index == 0 ? "P" : "D"}
                              </div>
                            </MarkerContent>
                            <MarkerTooltip>{stop.name}</MarkerTooltip>
                          </MapMarker>
                        ))}
                      </Map>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
