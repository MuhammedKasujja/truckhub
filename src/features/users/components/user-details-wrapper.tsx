"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { Edit2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getUserProfileById } from "@/features/users/service";
import { formatDate } from "@/lib/format";

type UserDetailsWrapperProps = {
  promises: Promise<[Awaited<ReturnType<typeof getUserProfileById>>]>;
};

export function UserDetailsWrapper({ promises }: UserDetailsWrapperProps) {
  const [{ data: user, error }] = React.use(promises);

  useFetchEror(error);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardAction>
            <Button asChild size={"icon"}>
              <Link href={`/users/${user?.id}/edit`}>
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
  );
}
