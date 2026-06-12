import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { createFileRoute } from "@tanstack/react-router"
import { BellIcon, MailIcon, PhoneIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/settings/notifications/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Card className="m-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          <CardTitle className="text-lg">Notification Settings</CardTitle>
        </div>
        <CardDescription>
          Configure how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Item>
          <ItemMedia>
            <MailIcon className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Email Notifications</ItemTitle>
            <ItemDescription>Receive notifications via email</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch />
          </ItemActions>
        </Item>
        <Item>
          <ItemMedia>
            <PhoneIcon className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>SMS Notifications</ItemTitle>
            <ItemDescription>Receive notifications via sms</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch />
          </ItemActions>
        </Item>
        <Item>
          <ItemContent>
            <ItemTitle>Push Notifications</ItemTitle>
            <ItemDescription>
              Receive push notifications in your browser
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch />
          </ItemActions>
        </Item>
        <Separator />
        <Item>
          <ItemContent>
            <ItemTitle>Push Notifications</ItemTitle>
            <ItemDescription>
              Receive push notifications in your browser
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch />
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  )
}
