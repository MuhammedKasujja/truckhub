import { QuotationForm } from "@/features/quotations/components"
import { IDSchema } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

export const Route = createFileRoute("/_admin/quotations/new/")({
  validateSearch: z.object({
    clientId: IDSchema.optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <QuotationForm />
}
