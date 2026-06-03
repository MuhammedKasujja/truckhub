import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingCustomer } from "@/features/bookings/types"
import { Link } from "@tanstack/react-router"

type BookingClientWidgetProps = {
  client: BookingCustomer
}

export function BookingClientWidget({ client }: BookingClientWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Button variant={"ghost"} className="text-lg font-semibold capitalize" asChild>
            <Link
              to={`/clients/$clientId/view`}
              
              params={{ clientId: client.id }}
            >
              {client.fullname}
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>{client.email}</div>
        <div>{client.phone}</div>
      </CardContent>
    </Card>
  )
}
