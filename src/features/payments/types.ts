import {
  PaymentModeList,
  PaymentStatuses,
  PaymentEntityList,
} from "@/config/constants";

export type PaymentMode = (typeof PaymentModeList)[number];

export type PaymentStatus = (typeof PaymentStatuses)[number];

export type PaymentType = (typeof PaymentEntityList)[number];

export type PaymentableEntity = {
  id: number;
  number: string;
  amount: string;
  balance: string;
};
export type PaymentCustomer = {
  id: number;
  fullname: string;
  phone: string;
  email: string;
};

export type Payment = {
  id: number;
  amount: number;
  number: string;
  payment_mode: PaymentMode;
  applied: number;
  refunded: number;
  entity_id: number;
  entity_type: PaymentType;
  status: PaymentStatus;
  date: Date;
  transaction_ref: string | null;
  entity: PaymentableEntity;
  customer: PaymentCustomer;
};

type PaymentStat = {
  newValue: number | string;
  oldValue: number | string;
};

export type PaymentStatistics = {
  grandTotal: PaymentStat;
  bookings: PaymentStat;
  rides: PaymentStat;
};
