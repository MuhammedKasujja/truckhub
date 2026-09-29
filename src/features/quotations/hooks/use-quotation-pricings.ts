import { EntityId } from "@/schemas"
import { useClientServiceProducts } from "@/features/clients/hooks/user-client-services"
import { useActiveServiceProducts } from "@/features/services/hooks/use-service-products"

type PricingSource = "client" | "company" | undefined

export function useQuotationServiceProducts(clientId: EntityId) {
  const clientQuery = useClientServiceProducts(clientId)

  // Fall back to company pricing when there's no client,
  // or the client query finished with no data / an error
  const shouldUseCompany =
    !clientId ||
    clientQuery.isError ||
    (clientQuery.isSuccess && !clientQuery.data)

  const companyQuery = useActiveServiceProducts({
    enabled: shouldUseCompany,
  })

  const active = shouldUseCompany ? companyQuery : clientQuery
  const source: PricingSource = active.data
    ? shouldUseCompany
      ? "company"
      : "client"
    : undefined

  return {
    pricing: active.data,
    source,
    isLoading: active.isLoading,
    isError: shouldUseCompany ? companyQuery.isError : clientQuery.isError,
    error: active.error,
    refetch: active.refetch,
  }
}
