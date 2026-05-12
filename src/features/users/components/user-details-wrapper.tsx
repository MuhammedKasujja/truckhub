"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Edit2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { formatDate } from "@/lib/format"
import { SystemUser } from "../types"

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
              <Link to={"/users/$userId/edit"} params={{ userId: user!.id }}>
                <Edit2Icon />
              </Link>
            </Button>
          </CardAction>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>{user?.email}</div>
          <div>{user?.phone}</div>
          <div>{formatDate(user?.created_at)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
