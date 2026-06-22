"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VehiclePicker } from "@/features/vehicles/components"
import {
  vehicleAssignDriverFn,
  vehicleUnAssignDriverFn,
} from "@/features/vehicles/services"
import { Edit2Icon, TrashIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import React from "react"
import { toast } from "sonner"
import { SubmitButton } from "@/components/ui/submit-button"
import { Driver } from "../types"
import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { Vehicle } from "@/features/vehicles/types"

type DriverDetailsProps = {
  driver: Driver
}

export function DriverDetails({ driver }: DriverDetailsProps) {
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>()
  const vehicle = driver?.vehicle

  async function assignDriver() {
    if (!selectedVehicle) {
      return toast.error("Please select a vehicle")
    }
    const { isSuccess, error, message } = await vehicleAssignDriverFn({
      data: {
        driverId: driver!.id,
        vehicleId: selectedVehicle.id,
      },
    })
    if (isSuccess) {
      toast.success(message)
    } else {
      toast.error(error?.message)
    }
  }

  async function unAssignDriverFromVehicle() {
    if (!vehicle) return

    const { isSuccess, error, message } = await vehicleUnAssignDriverFn({
      data: {
        id: vehicle.id,
      },
    })
    if (isSuccess) {
      toast.success(message)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader className="pb-2">
        <PageTitle>
          <PageBackButton />
          {driver?.fullname}
        </PageTitle>
        <PageAction>
          <Can permission="drivers:edit">
            <Button asChild size={"icon"}>
              <Link
                to={"/drivers/$driverId/edit"}
                params={{ driverId: driver?.id }}
              >
                <Edit2Icon />
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <div className="grid grid-flow-col gap-5 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="capitalize">{driver?.fullname}</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>{driver?.email}</div>
            <div>{driver?.phone}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Assign Vehicle to driver</CardTitle>
            <CardDescription>Attach vehicle to the driver</CardDescription>
          </CardHeader>
          <CardContent className="flex">
            <VehiclePicker
              value={selectedVehicle}
              onSelected={(vehicle) => setSelectedVehicle(vehicle)}
            />
          </CardContent>
          <CardFooter>
            <SubmitButton type="button" onClick={() => assignDriver()}>
              Submit
            </SubmitButton>
          </CardFooter>
        </Card>
      </div>
      {vehicle && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Vehicle</CardTitle>
            <CardAction>
              <Can permission="vehicles:unassign">
                <Button
                  variant={"outline"}
                  size={"sm"}
                  type="button"
                  onClick={() => unAssignDriverFromVehicle()}
                >
                  <TrashIcon className="mr-1" />
                  Remove Vehicle
                </Button>
              </Can>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Vehicle Number" value={vehicle.number} />

            <DetailItem label="Plate Number" value={vehicle.plate_number} />

            <DetailItem label="Year" value={vehicle.year} />

            <DetailItem
              label="Engine"
              value={`${vehicle.engine_type} • ${vehicle.gearbox} • ${vehicle.cylinders} Cylinders`}
            />

            <DetailItem label="Seats" value={vehicle.seats} />

            <DetailItem
              label="Tank Capacity"
              value={`${vehicle.tank_capacity} L`}
            />

            <DetailItem label="Exterior Color" value={vehicle.color} />

            <DetailItem label="Interior Color" value={vehicle.interior_color} />
          </CardContent>
        </Card>
      )}
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
