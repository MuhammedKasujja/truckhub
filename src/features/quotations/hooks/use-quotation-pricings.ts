import { EntityId } from "@/schemas"
import { useClientServiceProducts } from "@/features/clients/hooks/user-client-services"
import { useActiveServiceProducts } from "@/features/services/hooks/use-service-products"

type PricingSource = "client" | "company" | undefined

const hasItems = <T>(data?: T[]) => Array.isArray(data) && data.length > 0

/**
 * 
 * An empty client array is a valid result you want to show as-is, change shouldUseCompany to just `!clientId || clientQuery.isError`.
 * @param clientId 
 * @returns 
 */

export function useQuotationServiceProducts(clientId: EntityId) {
  const clientQuery = useClientServiceProducts(clientId)

  // Use company pricing when there's no client, the client query failed,
  // or it finished but came back empty
  const shouldUseCompany =
    !clientId ||
    clientQuery.isError ||
    (clientQuery.isSuccess && !hasItems(clientQuery.data))

  const companyQuery = useActiveServiceProducts({ enabled: shouldUseCompany })

  const active = shouldUseCompany ? companyQuery : clientQuery

  const source: PricingSource = hasItems(active.data)
    ? shouldUseCompany
      ? "company"
      : "client"
    : undefined

  return {
    pricing: active.data,
    source,
    // isLoading: active.isLoading,
    isLoading: clientQuery.isLoading || (shouldUseCompany && companyQuery.isLoading),
    isError: shouldUseCompany ? companyQuery.isError : clientQuery.isError,
    error: active.error,
    refetch: active.refetch,
  }
}
