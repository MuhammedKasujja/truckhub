"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VehicleSearchFilter } from "@/features/vehicles/components/vehicle-search-filter";
import { vehicleAssignDriver } from "@/features/vehicles/service";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { Edit2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { getDriverDetailsById } from "@/features/drivers/service";
import { SubmitButton } from "@/components/ui/submit-button";

type DriverDetailsProps = {
  promises: Promise<[Awaited<ReturnType<typeof getDriverDetailsById>>]>;
};

export function DriverDetails({ promises }: DriverDetailsProps) {
  const [{ data: driver, error }] = React.use(promises);
  const [vehicleId, setVehicleId] = React.useState<number | null>();

  useFetchEror(error);

  async function assignDriver() {
    const { isSuccess, error, message } = await vehicleAssignDriver({
      driver_id: driver!.id,
      vehicle_id: vehicleId!,
    });
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(error?.message);
    }
  }

  return (
    <div className="grid grid-cols-5 grid-flow-col gap-5">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{driver?.fullname}</CardTitle>
          <CardAction>
            <Button asChild size={"icon"}>
              <Link href={`/drivers/${driver?.id}/edit`}>
                <Edit2Icon />
              </Link>
            </Button>
          </CardAction>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <div>{driver?.email}</div>
          <div>{driver?.phone}</div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Assign Vehicle to driver</CardTitle>
          <CardDescription>Attach vehicle to the driver</CardDescription>
        </CardHeader>
        <CardContent className="flex">
          <VehicleSearchFilter
            className="flex-1"
            onSelected={(vehicle) => setVehicleId(vehicle?.id)}
          />
        </CardContent>
        <CardFooter>
          <SubmitButton type="button" onClick={() => assignDriver()}>
            Submit
          </SubmitButton>
        </CardFooter>
      </Card>
    </div>
  );
}
