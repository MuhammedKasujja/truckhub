export type Passenger = {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  profile_url?: string;
};

export type Driver = {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  profile_url?: string;
};

export type RideRequest = {
  id: number;
  number: string;
  origin: string;
  destination: string;
  created_at: Date;
  request_start_time: Date;
  status: RideStatus;
  partial: number | null;
  balance: number;
  discount: number;
  amount: number;
  customer: Passenger;
  driver: Driver | undefined;
  type: RideType;
};

export type RideRequestDetails = {
  id: number;
  number: string;
  origin: Location;
  destination: Location;
  created_at: string;
  polyline_route: string | undefined;
  request_start_time: Date;
  status: RideStatus;
  partial: number | undefined;
  balance: number;
  discount: number;
  distance: number;
  duration: number;
  amount: number;
  is_paid: number;
  customer: Passenger;
  driver: Driver | undefined;
  type: RideType;
  checkpoints: Location[];
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

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface Location extends LocationPoint {
  name: string;
}
