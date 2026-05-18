import {
  BatchPricingForm,
  type BatchPricingInput,
} from "@/features/settings/pricing"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/pricing-config/")({
  component: RouteComponent,
})

function RouteComponent() {
  function handleSubmit(data: BatchPricingInput): Promise<void> {
    console.log("Form data", data)
    return
  }

  return <BatchPricingForm onSubmit={handleSubmit} />
}
