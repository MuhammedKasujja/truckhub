import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import { BellIcon, MailIcon, PhoneIcon } from "lucide-react"

interface NotificationSettingsFormProps {
  onSubmit: (data: unknown) => void
}

export function NotificationSettingsForm({
  onSubmit,
}: NotificationSettingsFormProps) {
  const { history, clearHistory } = useNavigationHistory()

  return (
    <Card>
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
      <CardFooter>
        <div>
          {history.map((entry) => (
            <div key={entry.timestamp}>{entry.pathname}</div>
          ))}
        </div>
        <Button type="button" onClick={() => clearHistory()}>
          Clear ({history.length})
        </Button>
      </CardFooter>
    </Card>
  )
}
