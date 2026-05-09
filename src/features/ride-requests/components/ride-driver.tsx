import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Driver } from "../types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Can } from "@/components/has-permission";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MailIcon, PhoneIcon } from "lucide-react";

interface RideDriverProps {
  driver: Driver | undefined;
}

export function RideDriver({ driver }: RideDriverProps) {
  const generateAvatorFallback = () => {
    if (!driver) return "";
    const [firstName, lastName] = driver.fullname.split(" ");
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver</CardTitle>
        <CardAction>
          <Can permission="drivers:view">
            <Button variant={"secondary"} asChild>
              <Link href={`/drivers/${driver?.id}/view`}>View</Link>
            </Button>
          </Can>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <Avatar size="lg">
            <AvatarImage src={driver?.profile_url} alt="driver" />
            <AvatarFallback>{generateAvatorFallback()}</AvatarFallback>
          </Avatar>
          <p>{driver?.fullname}</p>
        </div>
        <Separator />
        <div className="flex flex-row gap-4 items-center">
          <PhoneIcon size={16} />
          <p>{driver?.phone}</p>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <MailIcon size={16} />
          <p>{driver?.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
