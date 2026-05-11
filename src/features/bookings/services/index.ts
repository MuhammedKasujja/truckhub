import { LocationPoint } from "@/features/bookings/types"
import {
  BookingUpdateSchema,
  BookingCreateSchema,
  BookingSearchParamsCache,
} from "@/features/bookings/schemas"
import { createServerFn } from "@tanstack/react-start"
import { EntityId, EntityIdSchema, SearchQuerySchema } from "@/schemas"
import {
  getBookings,
  updateBooking,
  createBooking,
  getBookingById,
  deleteBookingById,
  getBookingsByQuery,
  getBookingStatistics,
  getBookingDetailsById,
  computeBookingEsimatedFare,
} from "./server"

export const getBookingsFn = createServerFn({ method: "POST" })
  .inputValidator((data) => BookingSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return getBookings(data)
  })

export const getBookingsByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getBookingsByQuery(data)
  })

export const getBookingByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getBookingById(data.id)
  })

export const getBookingDetailsByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getBookingDetailsById(data.id)
  })

export const deleteBookingFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteBookingById(data.id)
  })

export const updateBookingFn = createServerFn()
  .inputValidator(BookingUpdateSchema)
  .handler(async ({ data }) => {
    return updateBooking(data)
  })

export const createBookingFn = createServerFn()
  .inputValidator(BookingCreateSchema)
  .handler(async ({ data }) => {
    return createBooking(data)
  })

export const getBookingStatisticsFn = createServerFn().handler(async () => {
  return getBookingStatistics()
})

/**
 * Get the estimated trip fare between the trip origin and destination
 * basing on the provided service
 * @param serviceId service selected
 * @param origin booking origin
 * @param destination booking destination
 * @returns
 */
export async function computeBookingEsimatedFareFn({
  serviceId,
  origin,
  destination,
}: {
  serviceId: EntityId
  origin: LocationPoint
  destination: LocationPoint
}) {
  return computeBookingEsimatedFare({ serviceId, origin, destination })
}
