import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Payment } from "@/features/payments/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslation } from "@/i18n"
import { formatDate, formatMoney } from "@/lib/format"
import { EyeIcon } from "lucide-react"

export function PaymentViewModal({ payment }: { payment: Payment }) {
  const isMobile = useIsMobile()
  const tr = useTranslation()
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant={"outline"} size={"icon"}>
          <EyeIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {tr("payment")} - {payment.number}
          </DrawerTitle>
          <DrawerDescription>{formatDate(payment.date)}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2 text-sm">
          <Card>
            <CardHeader>
              <CardTitle>{tr("payments.customer")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>{payment.client.fullname}</div>
              <div>{payment.client.email}</div>
              <div>{payment.client.phone}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {tr(`payments.${payment.entity_type}`)} -{" "}
                {payment.entity.number}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {formatMoney(payment.entity.amount)}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="header" className="text-muted-foreground">{tr("payments.amount")}</Label>
                {formatMoney(payment.amount)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="type" className="text-muted-foreground">{tr("payments.applied")}</Label>
                  {formatMoney(payment.applied)}
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="status" className="text-muted-foreground">{tr("payments.status")}</Label>
                  {tr(`payments.statuses.${payment.status}`)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" type="button">
              {tr("payments.form.close")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
