"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { CircleDotIcon, Edit2Icon, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getRideRequestDetailsById } from "@/features/ride-requests/service";
import {
  formatDate,
  formatDistance,
  formatDuration,
  formatPrice,
} from "@/lib/format";
import { Status } from "@/components/ui/status";
import { Can } from "@/components/has-permission";
import { EditPaymentModal } from "@/features/payments/components/edit-payment-modal";
import { RideRequestMap } from "./ride-request-map";
import { RidePassenger } from "./ride-passenger";
import { Layers, Rocket } from "lucide-react";

import {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
} from "@/components/ui/timeline";
import { RideTimeline } from "./ride-timeline";
import { RideDriver } from "./ride-driver";

const timelineItems = [
  {
    id: "project-kickoff",
    dateTime: "2025-01-15",
    date: "January 15, 2025",
    title: "Project Kickoff",
    description: "Initial meeting to define scope.",
    icon: Rocket,
  },
  {
    id: "design-phase",
    dateTime: "2025-02-01",
    date: "February 1, 2025",
    title: "Design Phase",
    description: "Created wireframes and mockups.",
    icon: Layers,
  },
];

type RideRequestDetailsWrapperProps = {
  promises: Promise<[Awaited<ReturnType<typeof getRideRequestDetailsById>>]>;
};

export function RideRequestDetailsWrapper({
  promises,
}: RideRequestDetailsWrapperProps) {
  const [{ data: ride, error }] = React.use(promises);

  useFetchEror(error);

  if (error) {
    return <div>Ride details not found</div>;
  }

  return (
    <div className="grid gap-5">
      <div className="grid md:grid-flow-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>R-{ride?.number}</CardTitle>
            <CardAction className="flex gap-4">
              {!ride?.is_paid && (
                <Can permission={"payments:create"}>
                  <EditPaymentModal
                    initialData={{
                      entity_id: ride?.id,
                      amount: ride?.balance,
                      type: "ride",
                    }}
                  />
                </Can>
              )}
              <Status>{ride?.status}</Status>
              <Button asChild>
                <Link href={`/rides/${ride?.id}/edit`}>
                  <Edit2Icon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>{formatDate(ride?.request_start_time)}</div>
            <div>{formatDate(ride?.created_at)}</div>
            <Timeline className="[--timeline-dot-size:2rem]">
              {[
                { ...ride!.origin, icon: MapPin },
                { ...ride!.destination, icon: CircleDotIcon },
              ].map((item) => (
                <TimelineItem key={item.name}>
                  <TimelineDot>
                    <item.icon className="size-3.5" />
                  </TimelineDot>
                  <TimelineConnector />
                  <TimelineContent>
                    <TimelineHeader>
                      <TimelineTime dateTime={ride?.created_at}>
                        {formatDate(ride?.created_at)}
                      </TimelineTime>
                      <TimelineTitle>{item.name}</TimelineTitle>
                    </TimelineHeader>
                    <TimelineDescription>
                      {/* {item.description} */}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
          <CardFooter className="space-y-4 flex items-center gap-2">
            <Button>{formatPrice(ride?.amount)}</Button>
            <Button>{formatPrice(ride?.balance)}</Button>
            <Button variant={"outline"}>
              Partial: {formatPrice(ride?.partial)}
            </Button>
          </CardFooter>
        </Card>
        <RidePassenger passenger={ride!.customer} />
        <RideDriver driver={ride!.customer} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>
              <span>ESTIMATED COST</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle>{formatPrice(ride!.amount)}</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>DISTANCE</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle>{formatDistance(ride!.distance)}</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>DURATION</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle>{formatDuration(ride!.duration)}</CardTitle>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-6 gap-5">
        <div className="col-span-4">
          <RideRequestMap
            origin={ride!.origin}
            destination={ride!.destination}
            waypoints={[]}
          />
        </div>
        <div className="col-span-2">
          <RideTimeline status={ride?.status} />
        </div>
      </div>
    </div>
  );
}
