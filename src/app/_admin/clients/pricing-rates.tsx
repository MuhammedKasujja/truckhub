import { BatchPricingInput } from "@/features/settings/pricing"
import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { jsonFormatter, logger } from "@/lib/logger"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/pricing-rates")({
  component: RouteComponent,
})

function RouteComponent() {
  async function handleSubmit(data: BatchPricingInput) {
    logger.info(jsonFormatter(data))
  }
  return <RoutePricingDataGridForm onSubmit={handleSubmit} />
}
