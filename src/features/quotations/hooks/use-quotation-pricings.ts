import { EntityId } from "@/schemas"
import { useClientServiceProducts } from "@/features/clients/hooks/user-client-services"

type PricingSource = 'client' | 'company' | undefined;

export function useQuotationServiceProducts(clientId: EntityId) {
  const { data: clientServices } = useClientServiceProducts(clientId)
}
