"use server";

import * as apiClient from "@/lib/api-client";
import {
  Booking,
  LocationPoint,
  BookingDetails,
  BookingStatistics,
} from "@/features/bookings/types";
import {
  BookingListSearchParams,
  BookingUpdateSchemaType,
  BookingCreateSchemaType,
} from "@/features/bookings/schemas";
import { EntityId, SearchQuery } from "@/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { LocationDistanceTime } from "@/server/actions/location";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

export async function getBookings(input: BookingListSearchParams) {
  const { page, perPage } = input;
  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<Booking[]>(`/v1/bookings/?${params}`);
  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };

  return { data: isSuccess ? data! : [], error, pagination };
}

export async function getBookingsByQuery({ search }: SearchQuery) {
  return getBookings({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  });
}

export async function getBookingById(bookingId: EntityId) {
  return await apiClient.getFn<Booking>(`/v1/bookings/${bookingId}?view=edit`);
}

export async function getBookingDetailsById(bookingId: EntityId) {
  return await apiClient.getFn<BookingDetails>(
    `/v1/bookings/${bookingId}?view=full`,
  );
}

export async function deleteBookingById(bookingId: EntityId) {
  return await apiClient.deleteFn(`/v1/bookings/${bookingId}`);
}

export async function updateBooking(data: BookingUpdateSchemaType) {
  const { id: bookingId, ...rest } = data;
  return await apiClient.putFn(`/v1/bookings/${bookingId}`, rest);
}

export async function createBooking(data: BookingCreateSchemaType) {
  return await apiClient.postFn("/v1/bookings", data);
}

export async function getBookingStatistics() {
  return await apiClient.getFn<BookingStatistics>("/v1/bookings/statistics");
}

/**
 * Get the estimated trip fare between the trip origin and destination
 * basing on the provided service
 * @param serviceId service selected
 * @param origin booking origin
 * @param destination booking destination
 * @returns
 */
export async function computeBookingEsimatedFare({
  serviceId,
  origin,
  destination,
}: {
  serviceId: EntityId;
  origin: LocationPoint;
  destination: LocationPoint;
}) {
  return await apiClient.postFn<LocationDistanceTime>(
    "/v1/bookings/compute-fare",
    {
      service_id: serviceId,
      origin,
      destination,
    },
  );
}
