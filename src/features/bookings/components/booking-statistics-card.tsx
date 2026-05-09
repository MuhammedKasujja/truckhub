"use client"

import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat";
import { formatPrice } from "@/lib/format";
import { DollarSign } from "lucide-react";
import { BookingStatistics } from "../types";

type Props ={
  statistics?: BookingStatistics
}
export function BookingStatisticsCard({statistics}:Props) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 ring-foreground/10 bg-card text-card-foreground rounded-xl mb-5 border">
      <Stat className="min-h-32 ring-0 md:border-r-2 border-b-2 md:border-b-0 sm:rounded-r-none">
        <StatLabel>Orders</StatLabel>
        <StatValue>{statistics?.total}</StatValue>
        <StatIndicator variant="icon" color="default">
          <DollarSign />
        </StatIndicator>
        <StatDescription>
          Last 7 days <StatTrend trend="up">+30%</StatTrend>
        </StatDescription>
      </Stat>
      <Stat className="min-h-32 ring-0 md:border-r-2 border-b-2 md:border-b-0 sm:rounded-r-none sm:rounded-l-none">
        <StatLabel>Confirmed</StatLabel>
        <StatValue>{statistics?.confirmed}</StatValue>
        <StatIndicator variant="icon" color="default">
          <DollarSign />
        </StatIndicator>
        <StatDescription>
          Last 7 days <StatTrend trend="up">+15%</StatTrend>
        </StatDescription>
      </Stat>
      <Stat className="min-h-32 ring-0 md:border-r-2 border-b-2 md:border-b-0 sm:rounded-r-none sm:rounded-l-none">
        <StatLabel>Payments</StatLabel>
        <StatValue>{formatPrice(statistics?.total_payments)}</StatValue>
        <StatIndicator variant="icon" color="default">
          <DollarSign />
        </StatIndicator>
        <StatDescription>
          Last 7 days <StatTrend trend="up">+23%</StatTrend>
        </StatDescription>
      </Stat>
      <Stat className="min-h-32 ring-0 sm:rounded-l-none">
        <StatLabel>Cancelled</StatLabel>
        <StatValue>{statistics?.canceled}</StatValue>
        <StatIndicator variant="icon" color="default">
          <DollarSign />
        </StatIndicator>
        <StatDescription>
          Last 7 days <StatTrend trend="down">-3%</StatTrend>
        </StatDescription>
      </Stat>
    </div>
  );
}
