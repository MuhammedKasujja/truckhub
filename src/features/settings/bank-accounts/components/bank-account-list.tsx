import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Copy,
  Landmark,
  MoreHorizontal,
  PencilIcon,
  ReceiptText,
  Star,
} from "lucide-react"
import { makeDefaultBankAccountFn } from "../services"
import { accountPurposeMeta } from "../labels"
import { BankAccountForm } from "./bank-account-form"
import { BankDetailsForm } from "./bank-details-form"
import type { BankAccount } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { cn } from "@/lib/utils"

type Props = {
  accounts: BankAccount[]
}

export function BankAccountList({ accounts }: Props) {
  // Active account first, then by bank name.
  const sorted = [...accounts].sort(
    (a, b) =>
      Number(b.is_active) - Number(a.is_active) ||
      a.bank.name.localeCompare(b.bank.name)
  )
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((account) => (
        <BankAccountCard key={account.id} account={account} />
      ))}
    </div>
  )
}

function maskAccountNumber(value: string) {
  return `•••• ${value.slice(-4)}`
}

function BankAccountCard({ account }: { account: BankAccount }) {
  const [open, setOpen] = useState<"bank" | "account">()
  const queryInvalidator = useQueryInvalidator()
  // The API may send a purpose the app doesn't know (or none).
  const purposes: Partial<Record<string, { label: string }>> = accountPurposeMeta
  const purpose = purposes[account.purpose]

  const makeDefault = useMutation({
    mutationFn: () => makeDefaultBankAccountFn({ data: { id: account.id } }),
    onSuccess: ({ isSuccess, message, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't update the account")
        return
      }
      toast.success(message ?? "Default account updated")
      queryInvalidator.bankAccounts.list.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(account.account_number)
      toast.success("Account number copied")
    } catch {
      toast.error("Couldn't copy to the clipboard")
    }
  }

  return (
    <>
      <article
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm",
          account.is_active && "border-primary/40 ring-1 ring-primary/20"
        )}
      >
        <div className="flex items-start gap-3 p-4 pb-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
              account.is_active && "bg-primary/10 text-primary"
            )}
          >
            <Landmark className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {account.bank.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {[purpose?.label, account.branch].filter(Boolean).join(" · ")}
            </p>
          </div>
          {account.is_active ? (
            <Badge>
              <Star />
              Default
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>

        <div className="space-y-1 px-4 pb-4">
          <p className="truncate text-xs text-muted-foreground">
            {account.account_name}
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={copyAccountNumber}
              title="Copy full account number"
              className="group/copy -ml-1 flex items-center gap-2 rounded px-1 font-mono text-lg font-semibold tracking-wider tabular-nums hover:bg-muted"
            >
              {maskAccountNumber(account.account_number)}
              <Copy className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100" />
            </button>
            <span className="rounded-md border px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {account.currency}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2">
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs text-muted-foreground",
              account.show_on_invoices && "text-foreground"
            )}
          >
            <ReceiptText className="size-3.5" />
            {account.show_on_invoices ? "Shown on invoices" : "Not on invoices"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${account.account_name}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => setOpen("account")}>
                <PencilIcon />
                Edit account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpen("bank")}>
                <Landmark />
                Edit bank details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyAccountNumber}>
                <Copy />
                Copy account number
              </DropdownMenuItem>
              {!account.is_active && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={makeDefault.isPending}
                    onSelect={() => makeDefault.mutate()}
                  >
                    <Star />
                    Make default
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>

      <BankAccountForm
        initialData={account}
        open={open === "account"}
        onOpenChange={(v) => setOpen(v ? "account" : undefined)}
      />
      <BankDetailsForm
        initialData={account.bank}
        open={open === "bank"}
        onOpenChange={(v) => setOpen(v ? "bank" : undefined)}
      />
    </>
  )
}
