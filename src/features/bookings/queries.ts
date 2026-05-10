export const bookingKeys = {
  all: () => ['bookings'],
  list: () => [...bookingKeys.all(), 'list'],
  details: () => [...bookingKeys.all(), 'detail'],
  detail: (id: string) => [...bookingKeys.details(), id],
}