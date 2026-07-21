import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Driver } from "../types"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MailIcon, PhoneIcon } from "lucide-react"
import { generateAvatorFallback } from "@/lib/format"

interface RideDriverProps {
  driver: Driver | undefined
}

export function RideDriver({ driver }: RideDriverProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver</CardTitle>
        <CardAction>
          <Can permission="drivers:view">
            <Button variant={"secondary"} asChild>
              <Link
                to={`/drivers/$driverId/view`}
                params={{ driverId: driver?.id }}
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
            <AvatarImage src={driver?.profile_url} alt="driver" />
            <AvatarFallback>
              {generateAvatorFallback(driver?.fullname)}
            </AvatarFallback>
          </Avatar>
          <p>{driver?.fullname}</p>
        </div>
        <Separator />
        <div className="flex flex-row items-center gap-4">
          <PhoneIcon size={16} />
          <p>{driver?.phone}</p>
        </div>
        <div className="flex flex-row items-center gap-4">
          <MailIcon size={16} />
          <p>{driver?.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
