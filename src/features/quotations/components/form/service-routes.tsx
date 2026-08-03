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
import { useMemo, useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"

type ServiceRoutesDialogProps = {
  clientId: EntityId
  onSelected: (route: RouteServiceInput) => void
}

export function ServiceRoutesDialog({
  clientId,
  onSelected,
}: ServiceRoutesDialogProps) {
  const [query, setQuery] = useState("")
  const { routes, isLoading } = useBookingRoutes()

  const filteredRoutes = useMemo(() => {
    return (routes ?? []).filter((route) => {
      const q = query.toLowerCase()

      return (
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q)
      )
    })
  }, [query, routes])

  return (
    <div className="space-y-4">
      <InputGroup className="flex-1">
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search routes by origin or destination..."
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      {filteredRoutes.map((route) => (
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
