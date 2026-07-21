"use client"

import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat"
import { formatMoney } from "@/lib/format"
import { DollarSign } from "lucide-react"
import { BookingStatistics } from "../types"
import { Card } from "@/components/ui/card"

type Props = {
  statistics?: BookingStatistics
}
export function BookingStatisticsCard({ statistics }: Props) {
  return (
    <Card className="mb-4 p-0">
      <div className="grid grid-flow-row md:grid-flow-col md:grid-cols-4">
        <div className="border-b p-4 md:border-r md:border-b-0">
          <Stat className="space-y-2 border-0 p-0 shadow-none">
            <StatLabel>Orders</StatLabel>
            <StatValue>{statistics?.total}</StatValue>
            <StatIndicator variant="icon" color="default">
              <DollarSign />
            </StatIndicator>
            <StatDescription>
              Last 7 days <StatTrend trend="up">+30%</StatTrend>
            </StatDescription>
          </Stat>
        </div>
        <div className="border-b p-4 md:border-r md:border-b-0">
          <Stat className="space-y-2 border-0 p-0 shadow-none">
            <StatLabel>Confirmed</StatLabel>
            <StatValue>{statistics?.confirmed}</StatValue>
            <StatIndicator variant="icon" color="default">
              <DollarSign />
            </StatIndicator>
            <StatDescription>
              Last 7 days <StatTrend trend="up">+15%</StatTrend>
            </StatDescription>
          </Stat>
        </div>
        <div className="border-b p-4 md:border-r md:border-b-0">
          <Stat className="space-y-2 border-0 p-0 shadow-none">
            <StatLabel>Payments</StatLabel>
            <StatValue>{formatMoney(statistics?.total_payments)}</StatValue>
            <StatIndicator variant="icon" color="default">
              <DollarSign />
            </StatIndicator>
            <StatDescription>
              Last 7 days <StatTrend trend="up">+23%</StatTrend>
            </StatDescription>
          </Stat>
        </div>
        <div className="p-4">
          <Stat className="space-y-2 border-0 p-0 shadow-none">
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
      </div>
    </Card>
  )
}
