import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { formatDateTime } from "@/lib/format"
import { SystemUser } from "../types"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { ActionIcon } from "@/components/icons"

type UserDetailsWrapperProps = {
  user: SystemUser | undefined
}

export function UserDetailsWrapper({ user }: UserDetailsWrapperProps) {
  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardAction>
            <Button asChild size={"icon"}>
              <Link
                to={"/settings/user-management/users/$userId/edit"}
                params={{ userId: user!.id }}
              >
                <ActionIcon action={"edit"}/>
              </Link>
            </Button>
          </CardAction>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <Item>
            <ItemContent>
              <ItemDescription>Name</ItemDescription>
              <ItemTitle>{user?.name}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemDescription>Phone</ItemDescription>
              <ItemTitle>{user?.phone ?? "-"}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemDescription>Email</ItemDescription>
              <ItemTitle>{user?.email}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemDescription>Username</ItemDescription>
              <ItemTitle>{user?.username ?? "-"}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemDescription>Last Login</ItemDescription>
              <ItemTitle>{formatDateTime(user?.last_login)}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemContent>
              <ItemDescription>Registration Date</ItemDescription>
              <ItemTitle>{formatDateTime(user?.created_at)}</ItemTitle>
            </ItemContent>
          </Item>
        </CardContent>
      </Card>
    </div>
  )
}
