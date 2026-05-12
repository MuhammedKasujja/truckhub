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
import { DriverSearchFilter } from "@/features/drivers/components/driver-search-filter"
import { Edit2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import React from "react"
import { toast } from "sonner"
import { Vehicle } from "../types"
import { vehicleAssignDriverFn } from "../services"

type VehicleDetailsProps = {
  vehicle: Vehicle | undefined
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const [driverId, setDriverId] = React.useState<number | undefined>(
    vehicle?.driver?.id
  )
  const driver = vehicle?.driver

  async function assignDriver() {
    if (!driverId) {
      toast.error("Please select a driver")
      return
    }
    const { isSuccess, error, message } = await vehicleAssignDriverFn({
      data: {
        vehicleId: vehicle!.id,
        driverId: driverId!,
      },
    })
    if (isSuccess) {
      toast.success(message)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <div className="grid grid-flow-col grid-cols-5 gap-5">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{vehicle?.display_name}</CardTitle>
          <CardAction>
            <Button asChild size={"icon"}>
              <Link to={`/vehicles/${vehicle?.id}/edit`}>
                <Edit2Icon />
              </Link>
            </Button>
          </CardAction>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      {driver ? (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Driver</CardTitle>
            <CardDescription>{driver.name}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>{driver.phone}</p>
            <p>{driver.email}</p>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => assignDriver()}
            >
              Change
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Assign Driver</CardTitle>
            <CardDescription>Attach new driver to the vehicle</CardDescription>
          </CardHeader>
          <CardContent className="flex">
            <DriverSearchFilter
              className="flex-1"
              onSelected={(driver) => {
                setDriverId(driver?.id)
              }}
            />
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={() => assignDriver()}>
              Submit
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
