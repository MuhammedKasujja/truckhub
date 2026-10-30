import { Invoice } from "../invoices/types";
import { Quotation } from "../quotations/types";
import { Payment } from "@/features/payments/types";

export type DashboardStatistics = {
  statistics: {
    clients: {
      total: number;
    };
    drivers: {
      total: number;
    };
    invoices: {
      total: number;
    };
    quotations: {
      total: number;
    };
    payments: {
      total_count: number;
      total_amount: number;
    };
  };
  recent_quotations: Quotation[];
  recent_invoices: Invoice[];
  recent_payments: Payment[];
};
