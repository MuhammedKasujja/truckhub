import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { useBookingRoutes } from "@/features/settings/booking-routes/hooks/use-booking-routes"
import { EntityId } from "@/schemas"
import { RouteServiceInput } from "../../schemas"

type ServiceRoutesDialogProps = {
  clientId: EntityId
  onSelected: (route: RouteServiceInput) => void
}

export function ServiceRoutesDialog({
  clientId,
  onSelected,
}: ServiceRoutesDialogProps) {
  const { routes, isLoading } = useBookingRoutes()
  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Item
          className="cursor"
          key={route.id}
          variant={"outline"}
          onClick={() => onSelected({ ...route, route_id: route.id })}
        >
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
