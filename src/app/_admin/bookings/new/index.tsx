import { TrucksBookingForm } from "@/features/bookings/components"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { servicesSearchQueryOptions } from "@/features/services/query-options"
import { hasPermission } from "@/lib/auth"
import { IDSchema } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

export const Route = createFileRoute("/_admin/bookings/new/")({
  validateSearch: z.object({
    clientId: IDSchema.optional(),
  }),
  component: RouteComponent,
  beforeLoad: () => hasPermission("bookings:create"),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(clientsSearchQueryOptions())
    return context.queryClient.ensureQueryData(servicesSearchQueryOptions())
  },
})

function RouteComponent() {
  return <TrucksBookingForm />
}
