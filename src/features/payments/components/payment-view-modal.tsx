import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Payment } from "@/features/payments/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/i18n";
import { formatDate, formatPrice } from "@/lib/format";
import { EyeIcon } from "lucide-react";

export function PaymentViewModal({ payment }: { payment: Payment }) {
  const isMobile = useIsMobile();
  const tr = useTranslation();
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
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Card>
            <CardHeader>
              <CardTitle>{tr("payments.customer")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {payment.customer.fullname}
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
              {formatPrice(payment.entity.amount)}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="header">{tr("payments.amount")}</Label>
                {formatPrice(payment.amount)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="type">{tr("payments.applied")}</Label>
                  {formatPrice(payment.applied)}
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="status">{tr("payments.status")}</Label>
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
  );
}
