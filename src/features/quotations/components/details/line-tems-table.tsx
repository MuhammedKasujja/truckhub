import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineItemRow } from "./line-item-row"
import { LineItemResponse } from "../../schemas"

interface LineItemsTableProps {
  lineItems: LineItemResponse[]
}

export function LineItemsTable({ lineItems }: LineItemsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
          Line items — {lineItems.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-[10px] tracking-wide text-muted-foreground uppercase">
              <th className="pr-3 pb-2 font-medium">#</th>
              <th className="pr-4 pb-2 font-medium">Item</th>
              <th className="px-3 pb-2 text-right font-medium">Unit price</th>
              <th className="px-3 pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 pl-3 text-right font-medium">Line total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => (
              <LineItemRow item={item} idx={i} key={i} />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
