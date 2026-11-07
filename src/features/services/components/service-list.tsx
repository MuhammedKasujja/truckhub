import { ServiceCard, ServiceGrid } from "./service-card"
import type { Service } from "@/features/services/types"

type ServiceListProps = {
  services: Service[]
  /** Show the edit / delete actions on each card. */
  showActions?: boolean
}

export function ServiceList({ services, showActions = true }: ServiceListProps) {
  return (
    <ServiceGrid>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          showActions={showActions}
        />
      ))}
    </ServiceGrid>
  )
}
