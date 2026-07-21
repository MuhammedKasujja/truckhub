import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SystemUser } from "../types"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { formatDate } from "@/lib/format"

type UserProfileViewProps = {
  user: SystemUser
}
export function UserProfileView({ user }: UserProfileViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Item>
          <ItemContent>
            <ItemDescription>Name</ItemDescription>
            <ItemTitle>{user.name}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Phone</ItemDescription>
            <ItemTitle>{user.phone}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Email</ItemDescription>
            <ItemTitle>{user.email}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Username</ItemDescription>
            <ItemTitle>{user.username}</ItemTitle>
          </ItemContent>
        </Item>
      </CardContent>
      <CardFooter>
        <Item>
          <ItemContent>
            <ItemDescription>Joined Date</ItemDescription>
            <ItemTitle>{formatDate(user.created_at)}</ItemTitle>
          </ItemContent>
        </Item>
      </CardFooter>
    </Card>
  )
}
