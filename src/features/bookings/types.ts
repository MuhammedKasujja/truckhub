import { Payment } from "@/features/payments/types";

export type BookingCustomer = {
  id: number;
  fullname: string;
  phone: string;
  email: string;
};

export type BookingServiceItem = {
  service_id: number;
  service_name: string;
  cost_per_item: number;
  total_items: number;
  discount: number;
};

export type Booking = {
  id: number;
  number: string;
  created_at: Date;
  request_start_time: Date;
  pickup_time: Date;
  return_time: Date;
  estimated_pickup_time: Date;
  estimated_return_time: Date;
  status: BookingStatus;
  partial: number | null;
  balance: number;
  discount: number;
  amount: number;
  services: BookingServiceItem[];
  customer: BookingCustomer;
};

export type BookingDetails = {
  id: number;
  number: string;
  created_at: Date;
  pickup_time: Date;
  return_time: Date;
  is_paid: boolean;
  status: BookingStatus;
  partial: number | undefined;
  balance: number;
  discount: number;
  amount: number;
  services: BookingServiceItem[];
  customer: BookingCustomer;
  payments: Payment[];
};

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface Location extends LocationPoint {
  name: string;
}

export type BookingStatistics = {
  total: number;
  confirmed: number;
  canceled: number;
  total_payments: number | string;
};
