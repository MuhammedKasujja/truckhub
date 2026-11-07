import React, { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import Decimal from "decimal.js"
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  Landmark,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useCreatePayment } from "../hooks/use-payments"
import type { PaymentEditSchemaType } from "@/features/payments/schemas"
import type { PaymentModeList } from "@/config/constants"
import type { EntityId } from "@/schemas"
import type z from "zod"
import { paymentInputSchema } from "@/features/payments/schemas"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { MoneyField, TextField } from "@/components/ui/form-fields"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslation } from "@/i18n"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { BookingPickerField } from "@/features/bookings/components/booking-picker"
import { RidePickerField } from "@/features/ride-requests/components"
import { InvoiceStatusIndicator } from "@/features/invoices/components/invoice-status-indicator"
import { InvoicePickerField } from "@/features/invoices/components/invoice-picker"
import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"

type PaymentFormValues = z.infer<typeof paymentInputSchema>
type PaymentMethod = (typeof PaymentModeList)[number]

type PaymentFormProps = {
  initialData?: Partial<PaymentEditSchemaType>
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAYMENT_METHODS: {
  value: PaymentMethod
  icon: React.ComponentType<{ className?: string }>
  refLabel: string
  refPlaceholder: string
}[] = [
  {
    value: "cash",
    icon: Banknote,
    refLabel: "Receipt number",
    refPlaceholder: "e.g. RCT-0042",
  },
  {
    value: "mobile_money",
    icon: Smartphone,
    refLabel: "Transaction ID",
    refPlaceholder: "Mobile money transaction ID",
  },
  {
    value: "bank_transfer",
    icon: Landmark,
    refLabel: "Bank reference",
    refPlaceholder: "Transfer or deposit reference",
  },
  {
    value: "credit_card",
    icon: CreditCard,
    refLabel: "Authorization code",
    refPlaceholder: "Card authorization code",
  },
]

const toDecimal = (value: string | number | null | undefined) => {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

export function EnterPaymentModal({
  initialData,
  open,
  onOpenChange,
}: PaymentFormProps) {
  const isMobile = useIsMobile()
  const tr = useTranslation()
  const { pay, isPending } = useCreatePayment()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentInputSchema),
    defaultValues: initialData,
    mode: "onChange",
  })

  const type = initialData?.type
  const entityId = useWatch({ control: form.control, name: "entityId" })
  const amount = useWatch({ control: form.control, name: "amount" })
  const method = useWatch({ control: form.control, name: "paymentMethod" })

  // Invoice opened from a specific invoice: show its summary instead of a picker
  const isInvoiceLocked = type === "invoice" && !!initialData?.entityId

  const { data: invoiceResponse, isLoading: isLoadingInvoice } = useQuery({
    ...invoiceDetailsQueryOptions(entityId),
    enabled: open && type === "invoice" && !!entityId,
  })
  const invoice = invoiceResponse?.data

  // Callers don't always pass the client or amount; fill them from the invoice
  useEffect(() => {
    if (!invoice) return
    if (!form.getValues("clientId")) {
      form.setValue("clientId", invoice.client.id)
    }
    if (!form.getValues("amount")) {
      form.setValue("amount", invoice.balance_due, { shouldValidate: true })
    }
  }, [invoice, form])

  const balance = invoice ? toDecimal(invoice.balance_due) : null
  const enteredAmount = toDecimal(amount)
  const remaining = balance ? balance.minus(enteredAmount) : null
  const isOverpaying = !!remaining && remaining.lt(0)
  const methodMeta = PAYMENT_METHODS.find((m) => m.value === method)

  function onSubmit(values: PaymentFormValues) {
    pay(values, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="flex-row items-center gap-3 border-b text-left">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-5" />
          </div>
          <div className="min-w-0">
            <DrawerTitle>{tr("payments.form.enterPayment")}</DrawerTitle>
            <DrawerDescription>
              Record money received against{" "}
              {type === "invoice" ? "an invoice" : `a ${type ?? "record"}`}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <form
            id="form-payment"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* What is being paid */}
            <section className="space-y-3">
              {type === "booking" && (
                <BookingPickerField
                  label="Booking"
                  control={form.control}
                  name={"entityId"}
                  onSelected={(booking) => {
                    form.setValue("amount", booking?.balance ?? "", {
                      shouldValidate: true,
                    })
                  }}
                />
              )}
              {type === "ride" && (
                <RidePickerField
                  label={"Ride"}
                  name={"entityId"}
                  control={form.control}
                  onSelected={(ride) => {
                    form.setValue("amount", ride?.balance ?? "", {
                      shouldValidate: true,
                    })
                  }}
                />
              )}
              {type === "invoice" && !isInvoiceLocked && (
                <InvoicePickerField
                  label={"Invoice"}
                  name={"entityId"}
                  control={form.control}
                  filters={{
                    status: ["draft", "partially_paid", "issued"],
                    client_id: initialData?.clientId,
                  }}
                  onChange={(selected) => {
                    form.setValue("amount", selected?.balance_due ?? "", {
                      shouldValidate: true,
                    })
                    form.setValue("clientId", selected?.client.id)
                  }}
                />
              )}

              {type === "invoice" && entityId && (
                <>
                  {isLoadingInvoice && (
                    <Skeleton className="h-32 w-full rounded-lg" />
                  )}
                  {invoice && (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{invoice.number}</p>
                          <p className="truncate text-sm text-muted-foreground capitalize">
                            {invoice.client.name}
                          </p>
                        </div>
                        <InvoiceStatusIndicator status={invoice.status} />
                      </div>
                      <dl className="grid grid-cols-3 gap-2 text-sm">
                        <MiniStat
                          label="Total"
                          value={formatMoney(invoice.total)}
                        />
                        <MiniStat
                          label="Paid"
                          value={formatMoney(invoice.amount_paid ?? 0)}
                        />
                        <MiniStat
                          label="Balance"
                          value={formatMoney(invoice.balance_due)}
                          strong
                        />
                      </dl>
                      <Progress
                        value={
                          toDecimal(invoice.total).gt(0)
                            ? toDecimal(invoice.amount_paid)
                                .div(invoice.total)
                                .times(100)
                                .toNumber()
                            : 0
                        }
                        aria-label="Amount paid so far"
                      />
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Amount */}
            <section className="space-y-2">
              <MoneyField
                label={tr("payments.amount")}
                name={"amount"}
                control={form.control}
              />
              {balance && balance.gt(0) && (
                <div className="flex flex-wrap gap-1.5">
                  <AmountChip
                    label="Full balance"
                    active={enteredAmount.eq(balance)}
                    onClick={() =>
                      form.setValue("amount", balance.toString(), {
                        shouldValidate: true,
                      })
                    }
                  />
                  <AmountChip
                    label="Half"
                    active={enteredAmount.eq(balance.div(2).toDecimalPlaces(2))}
                    onClick={() =>
                      form.setValue(
                        "amount",
                        balance.div(2).toDecimalPlaces(2).toString(),
                        { shouldValidate: true }
                      )
                    }
                  />
                </div>
              )}
              {remaining && enteredAmount.gt(0) && (
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    isOverpaying
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  {isOverpaying ? (
                    <>
                      <AlertTriangle className="size-3.5" />
                      {formatMoney(remaining.abs().toString())} more than the
                      balance due
                    </>
                  ) : remaining.eq(0) ? (
                    "Settles the invoice in full"
                  ) : (
                    <>
                      {formatMoney(remaining.toString())} will remain
                      outstanding
                    </>
                  )}
                </p>
              )}
            </section>

            {/* Method */}
            <Controller
              control={form.control}
              name="paymentMethod"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Payment method</FieldLabel>
                  <RadioGroup
                    // Starts unset at runtime even though the schema type is non-optional;
                    // "" keeps the radio group controlled.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-2"
                  >
                    {PAYMENT_METHODS.map(({ value, icon: Icon }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50",
                          field.value === value &&
                            "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                      >
                        <RadioGroupItem value={value} className="sr-only" />
                        <Icon
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground",
                            field.value === value && "text-primary"
                          )}
                        />
                        <span className="truncate font-medium">
                          {tr(`payments.methods.${value}`)}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError>Select a payment method</FieldError>
                  )}
                </Field>
              )}
            />

            {/* Reference */}
            <FieldGroup>
              <TextField
                label={methodMeta?.refLabel ?? "Transaction reference"}
                placeholder={methodMeta?.refPlaceholder ?? "Optional"}
                name={"transactionRef"}
                control={form.control}
                required={false}
              />
            </FieldGroup>
          </form>
        </div>

        <DrawerFooter className="border-t">
          <Button type="submit" form="form-payment" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {enteredAmount.gt(0)
              ? `Record ${formatMoney(enteredAmount.toString())}`
              : "Record payment"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isPending}>
              {tr("payments.form.cancel")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function MiniStat({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "truncate tabular-nums",
          strong && "font-semibold text-primary"
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function AmountChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="h-7 px-2.5 text-xs"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
