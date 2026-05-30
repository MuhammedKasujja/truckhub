import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Passenger } from "../types"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { MailIcon, PhoneIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { generateAvatorFallback } from "@/lib/format"

interface RidePassengerProps {
  passenger: Passenger
}

export function RidePassenger({ passenger }: RidePassengerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger</CardTitle>
        <CardAction>
          <Can permission="clients:view">
            <Button variant={"secondary"} asChild>
              <Link
                to={`/clients/$clientId/view`}
                params={{ clientId: passenger.id }}
              >
                View
              </Link>
            </Button>
          </Can>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={passenger?.profile_url} alt="driver" />
            <AvatarFallback>
              {generateAvatorFallback(passenger.fullname)}
            </AvatarFallback>
          </Avatar>
          <p>{passenger?.fullname}</p>
        </div>
        <Separator />
        <div className="flex flex-row items-center gap-4">
          <PhoneIcon size={16} />
          <p>{passenger?.phone}</p>
        </div>
        <div className="flex flex-row items-center gap-4">
          <MailIcon size={16} />
          <p>{passenger?.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
