import { Payment } from "@/features/payments/types";
import { Booking } from "@/features/bookings/types";
import { RideRequest } from "@/features/ride-requests/types";

export type DashboardStatistics = {
  statistics: {
    customers: {
      total: number;
    };
    drivers: {
      total: number;
    };
    bookings: {
      total: number;
    };
    rides: {
      total: number;
    };
    payments: {
      total_count: number;
      total_amount: number;
    };
  };
  recent_bookings: Booking[];
  recent_rides: RideRequest[];
  recent_payments: Payment[];
};
