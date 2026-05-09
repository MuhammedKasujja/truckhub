"use server";

import * as apiClient from "@/lib/api-client";
import {
  RideRequest,
  LocationPoint,
  RideRequestDetails,
} from "@/features/ride-requests/types";
import {
  RideRequestListSearchParams,
  RideRequestUpdateSchemaType,
  RideRequestCreateSchemaType,
} from "@/features/ride-requests/schemas";
import { EntityId, SearchQuery } from "@/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { LocationDistanceTime } from "@/server/actions/location";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

export async function getRideRequests(input: RideRequestListSearchParams) {
  const { page, perPage } = input;
  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<RideRequest[]>(
    `/v1/ride_requests/?${params}`,
  );
  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };

  return { data: isSuccess ? data! : [], error, pagination };
}

export async function getRideRequestsByQuery({ search }: SearchQuery) {
  return getRideRequests({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  });
}

export async function getRideRequestById(bookingId: EntityId) {
  return await apiClient.getFn<RideRequest>(
    `/v1/ride_requests/${bookingId}?view=edit`,
  );
}

export async function getRideRequestDetailsById(bookingId: EntityId) {
  return await apiClient.getFn<RideRequestDetails>(
    `/v1/ride_requests/${bookingId}?view=full`,
  );
}

export async function deleteRideRequestById(bookingId: EntityId) {
  return await apiClient.deleteFn(`/v1/ride_requests/${bookingId}`);
}

export async function updateRideRequest(data: RideRequestUpdateSchemaType) {
  const { id: bookingId, ...rest } = data;
  return await apiClient.putFn(`/v1/ride_requests/${bookingId}`, rest);
}

export async function createRideRequest(data: RideRequestCreateSchemaType) {
  return await apiClient.postFn("/v1/ride_requests", data);
}

/**
 * Get the estimated trip fare between the trip origin and destination
 * basing on the provided service
 * @param serviceId service selected
 * @param origin booking origin
 * @param destination booking destination
 * @returns
 */
export async function computeRideRequestEsimatedFare({
  serviceId,
  origin,
  destination,
}: {
  serviceId: EntityId;
  origin: LocationPoint;
  destination: LocationPoint;
}) {
  return await apiClient.postFn<LocationDistanceTime>(
    "/v1/ride_requests/compute-fare",
    {
      service_id: serviceId,
      origin,
      destination,
    },
  );
}

export async function getActiveRides() {
  return getRideRequests({
    page: 1,
    perPage: 30,
    sort: [],
    search: "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  });
}
