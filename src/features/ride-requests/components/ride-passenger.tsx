import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Passenger } from "../types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Can } from "@/components/has-permission";
import { MailIcon, PhoneIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RidePassengerProps {
  passenger: Passenger;
}

export function RidePassenger({ passenger }: RidePassengerProps) {
  const generateAvatorFallback = () => {
    if (!passenger) return "";
    const [firstName, lastName] = passenger.fullname.split(" ");
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger</CardTitle>
        <CardAction>
          <Can permission="clients:view">
            <Button variant={"secondary"} asChild>
              <Link href={`/customers/${passenger.id}/view`}>View</Link>
            </Button>
          </Can>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <Avatar size="lg">
            <AvatarImage src={passenger?.profile_url} alt="driver" />
            <AvatarFallback>{generateAvatorFallback()}</AvatarFallback>
          </Avatar>
          <p>{passenger?.fullname}</p>
        </div>
        <Separator />
        <div className="flex flex-row gap-4 items-center">
          <PhoneIcon size={16} />
          <p>{passenger?.phone}</p>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <MailIcon size={16} />
          <p>{passenger?.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
