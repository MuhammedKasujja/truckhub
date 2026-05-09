import { EntityId } from "@/types";
import { DriverListSearchParams } from "./schemas";
import { queryOptions } from "@tanstack/react-query";
import { getDriverById, getDrivers } from "./service";

export function createDriverListQueryOptions(input: DriverListSearchParams) {
  return queryOptions({
    queryKey: ["drivers"],
    queryFn: () => getDrivers(input),
  });
}

export function createDriverQueryOptions(driverId: EntityId) {
  return queryOptions({
    queryKey: ["drivers", driverId],
    queryFn: () => getDriverById(driverId),
  });
}
