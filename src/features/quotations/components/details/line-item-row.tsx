import { ArrowRight, Package, Truck } from "lucide-react";
import { LineItemResponse } from "../../schemas";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

type RouteLeg = {
  origin: string
  destination: string
}

export function LineItemRow({ item, idx }: { item: LineItemResponse; idx: number }) {
  const isService = item.source === "service"
  return (
    <tr className="border-b border-border align-top last:border-0 hover:bg-muted/50">
      <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">
        {String(idx + 1).padStart(2, "0")}
      </td>
      <td className="py-3 pr-4">
        <div className="mb-1.5 flex items-center gap-2">
          {isService ? (
            <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <Package className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {isService ? "Chauffeured vehicle hire" : "Freight haulage"}
          </span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {isService ? (
            <>
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-normal"
              >
                {item.engine_mode === "wet" ? "wet lease" : "dry lease"}
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-normal"
              >
                {item.with_driver ? "with driver" : "self-drive"}
              </Badge>
              {item.vehicle_year && (
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] font-normal"
                >
                  MY {item.vehicle_year}
                </Badge>
              )}
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-normal"
              >
                {item.tonnage}t capacity
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-normal"
              >
                {item.with_loaders ? "with loaders" : "no loaders"}
              </Badge>
            </>
          )}
        </div>
        {item.locations?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.locations.map((leg, i) => (
              <RouteChip key={i} leg={leg} />
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-right font-mono text-xs whitespace-nowrap text-muted-foreground">
        {formatMoney(item.unit_price)}
      </td>
      <td className="px-3 py-3 text-right font-mono text-xs text-muted-foreground">
        ×{item.quantity}
      </td>
      <td className="py-3 pl-3 text-right font-mono text-sm font-semibold whitespace-nowrap text-foreground">
        {formatMoney(item.line_total)}
      </td>
    </tr>
  )
}

function RouteChip({ leg }: { leg: RouteLeg }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
      {leg.origin}
      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
      {leg.destination}
    </span>
  )
}