import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { useBookingRoutes } from "@/features/settings/booking-routes/hooks/use-booking-routes"
import { EntityId } from "@/schemas"

type ServiceRoutesDialogProps = {
  clientId: EntityId
}

export function ServiceRoutesDialog({ clientId }: ServiceRoutesDialogProps) {
  const { routes, isLoading } = useBookingRoutes()
  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Item key={route.id}>
          <ItemContent>
            <ItemHeader>
              <ItemTitle>{route.destination}</ItemTitle>
              <ItemDescription>
                {route.min_hrs} - {route.max_hrs} hrs
              </ItemDescription>
            </ItemHeader>
          </ItemContent>
        </Item>
      ))}
    </div>
  )
}
