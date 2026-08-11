import { EntityId } from "@/schemas";
import { LocationData } from "../bookings/types";

export type Passenger = {
  id: EntityId;
  fullname: string;
  phone: string;
  email: string;
  profile_url?: string;
};

export type Driver = {
  id: EntityId;
  fullname: string;
  phone: string;
  email: string;
  profile_url?: string;
};

export type RideRequest = {
  id: EntityId;
  number: string;
  origin: string;
  destination: string;
  created_at: Date;
  request_start_time: Date;
  status: RideStatus;
  partial: string | null;
  balance: string;
  discount: string;
  amount: string;
  client: Passenger;
  driver: Driver | undefined;
  type: RideType;
};

export type RideRequestDetails = {
  id: EntityId;
  number: string;
  origin: LocationData;
  destination: LocationData;
  created_at: string;
  polyline_route: string | undefined;
  request_start_time: Date;
  status: RideStatus;
  partial: string | null;
  balance: string;
  discount: string;
  distance: string;
  duration: number;
  amount: string;
  is_paid: number;
  client: Passenger;
  driver: Driver | undefined;
  type: RideType;
  checkpoints: LocationData[];
};

export const RideStatusList = [
  "pending",
  "matched",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
] as const;

export type RideStatus = (typeof RideStatusList)[number];

export const RideTypeList = [
  "passenger",
  "scheduled_passenger",
  "cargo",
  "scheduled_cargo",
] as const;

export type RideType = (typeof RideTypeList)[number];
