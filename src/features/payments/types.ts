import {
  PaymentType,
  PaymentModeList,
  PaymentStatuses,
} from "@/config/constants";
import { EntityId } from "@/schemas";

export type PaymentMode = (typeof PaymentModeList)[number];

export type PaymentStatus = (typeof PaymentStatuses)[number];


export type PaymentableEntity = {
  id: EntityId;
  number: string;
  amount: string;
  balance: string;
};
export type PaymentCustomer = {
  id: EntityId;
  fullname: string;
  phone: string;
  email: string;
};

export type Payment = {
  id: EntityId;
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
  client: PaymentCustomer;
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
