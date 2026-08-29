"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DriverPicker } from "@/features/drivers/components"
import { Edit2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import React from "react"
import { toast } from "sonner"
import { Vehicle, VehicleDriver } from "../types"
import { vehicleAssignDriverFn } from "../services"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { Can } from "@/components/has-permission"
import { Field } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/format"
import { VehicleStatusIndicator } from "./vehicle-status-indicator"

type VehicleDetailsProps = {
  vehicle: Vehicle
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const queryInvalidator = useQueryInvalidator()
  const [driver, setDriver] = React.useState(vehicle?.driver)
  const [isChangeDriver, setIsChangeDriver] = React.useState(false)

  async function assignDriver() {
    if (!driver) {
      toast.error("Please select a driver")
      return
    }
    const { isSuccess, error, message } = await vehicleAssignDriverFn({
      data: {
        vehicleId: vehicle!.id,
        driverId: driver.id,
      },
    })
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.vehicles.details(vehicle!.id).invalidate()
      queryInvalidator.drivers.details(driver.id).invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {vehicle.car_model.car_brand.name} - {vehicle.car_model.name}
          </h1>
          <div className="flex gap-2 text-muted-foreground">
            <div>
              {vehicle.number} • {vehicle.plate_number}
            </div>
            <VehicleStatusIndicator status={vehicle.status}/>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <Badge variant="secondary" className="w-fit">
            {vehicle.category.name}
          </Badge> */}
          <Can permission="vehicles:edit">
            <Button size={"icon-sm"} asChild>
              <Link
                to="/vehicles/$vehicleId/edit"
                params={{ vehicleId: vehicle.id }}
              >
                <Edit2Icon />
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Consumption Rate</p>
            <p className="text-2xl font-bold">
              {formatNumber(vehicle.fuel_consumption_rate)} km/L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Cylinders</p>
            <p className="text-2xl font-bold">{vehicle.cylinders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Tank Capacity</p>
            <p className="text-2xl font-bold">
              {formatNumber(vehicle.tank_capacity)} L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Seats</p>
            <p className="text-2xl font-bold">{vehicle.seats ?? "-"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicle Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <DetailItem label="Vehicle Number" value={vehicle.number} />

              <DetailItem label="Plate Number" value={vehicle.plate_number} />
              {vehicle.category.is_truck && (
                <DetailItem
                  label="Second Plate"
                  value={vehicle.second_plate_number ?? "-"}
                />
              )}

              <DetailItem
                label="Make/Model"
                value={
                  <>
                    {vehicle.car_model.car_brand.name}/{vehicle.car_model.name}
                  </>
                }
              />

              <DetailItem label="Type" value={vehicle.category.name} />

              <DetailItem
                label="Drive Train"
                value={vehicle.drive_train.name}
              />

              <DetailItem label="Year" value={vehicle.year} />

              <DetailItem label="Gearbox" value={vehicle.gearbox} />

              <DetailItem label="Engine Type" value={vehicle.engine_type} />

              <DetailItem label="Exterior Color" value={vehicle.color} />

              <DetailItem
                label="Interior Color"
                value={vehicle.interior_color}
              />
              {vehicle.category.is_truck && (
                <DetailItem
                  label="Tonnage Capacity"
                  value={vehicle.tonnage_capacity ?? "-"}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Driver */}
        {vehicle.driver && !isChangeDriver ? (
          <DriverDetails
            driver={vehicle.driver}
            onChangeDriver={() => {
              setIsChangeDriver(true)
              setDriver(null)
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Assign Driver</CardTitle>
              <CardDescription>
                Attach new driver to the vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1">
              <DriverPicker
                value={driver?.id}
                onSelected={(driver) => {
                  if (driver) setDriver({ ...driver, name: driver?.fullname })
                  else setDriver(null)
                }}
              />
            </CardContent>
            <CardFooter className="grid grid-cols-2 items-end gap-4">
              {vehicle.driver && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setDriver(null)
                    setIsChangeDriver(false)
                  }}
                  variant={"outline"}
                >
                  Cancel
                </Button>
              )}
              <Button
                className="w-full"
                onClick={() => assignDriver()}
                disabled={driver === null}
              >
                Submit
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Vehicle Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {vehicle.features.map((feat) => (
            <Field
              key={feat.id}
              orientation="horizontal"
              className="capitalize"
            >
              <Checkbox id={feat.id} name={feat.id} checked={true} />
              <Label htmlFor={feat.id}>{feat.name}</Label>
            </Field>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <DetailItem label="Vehicle ID" value={vehicle.id} />

          <DetailItem
            label="Created At"
            value={new Date(vehicle.created_at).toLocaleString()}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>

      <p className="wrap-break-words font-medium">{value}</p>
    </div>
  )
}

function DriverDetails({
  driver,
  onChangeDriver,
}: {
  driver: VehicleDriver
  onChangeDriver: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Driver</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium capitalize">{driver.name}</p>
          <p className="text-sm text-muted-foreground">{driver.email}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Phone</p>
          <p>{driver.phone}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Driver ID</p>
          <p className="text-xs break-all">{driver.number}</p>
        </div>
        <Button
          type="button"
          className="w-full"
          variant={"secondary"}
          onClick={onChangeDriver}
        >
          Change Driver
        </Button>
      </CardContent>
    </Card>
  )
}
