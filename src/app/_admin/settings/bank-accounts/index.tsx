import React from "react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Landmark, PencilIcon, Plus, WalletCards } from "lucide-react"
import type { Bank } from "@/features/settings/bank-accounts/types"
import { Button } from "@/components/ui/button"
import {
  SectionEmpty,
  SettingsPage,
  SettingsPageHeader,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import {
  BankAccountForm,
  BankAccountList,
  BankDetailsForm,
} from "@/features/settings/bank-accounts/components"
import { bankCountryMeta } from "@/features/settings/bank-accounts/labels"
import {
  bankAccountsListQueryOptions,
  banksListQueryOptions,
} from "@/features/settings/bank-accounts/query-options"
import { formatPlural } from "@/lib/format"

/** Falls back to the raw code for countries the app has no name for. */
function countryLabel(code: string) {
  const meta: Partial<Record<string, { label: string }>> = bankCountryMeta
  return meta[code]?.label ?? code
}

export const Route = createFileRoute("/_admin/settings/bank-accounts/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(bankAccountsListQueryOptions()),
})

function RouteComponent() {
  const { data: accounts } = useSuspenseQuery(bankAccountsListQueryOptions())
  const { data: banks = [] } = useQuery(banksListQueryOptions())
  const [open, setOpen] = React.useState<"bank" | "account">()
  // Kept after closing so the dialog doesn't flip to "Add" while it animates out.
  const [editingBank, setEditingBank] = React.useState<Bank>()
  const [isEditingBank, setIsEditingBank] = React.useState(false)

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={Landmark}
        title="Bank accounts"
        description="The accounts clients pay into. The default account is used for payments, and any account marked for invoices is printed on them."
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen("bank")}>
              <Landmark />
              Add bank
            </Button>
            <Button onClick={() => setOpen("account")}>
              <Plus />
              Add account
            </Button>
          </>
        }
      />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Accounts</h2>
          <span className="text-xs text-muted-foreground">
            {formatPlural(accounts.length, {
              singular: "account",
              plural: "accounts",
            })}
          </span>
        </div>
        {accounts.length === 0 ? (
          <SectionEmpty
            icon={WalletCards}
            title="No bank accounts yet"
            description="Add the account clients should pay into. You can show it on invoices and set it as the default for payments."
            className="bg-card py-14"
            action={
              <Button size="sm" onClick={() => setOpen("account")}>
                <Plus />
                Add your first account
              </Button>
            }
          />
        ) : (
          <BankAccountList accounts={accounts} />
        )}
      </section>

      <SettingsSection
        icon={Landmark}
        title="Banks"
        description="Banks available when you add an account"
        action={
          <Button variant="ghost" size="sm" onClick={() => setOpen("bank")}>
            <Plus />
            Add bank
          </Button>
        }
      >
        {banks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No banks yet. Add one before creating an account.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {banks.map((bank) => (
              <li key={bank.id}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBank(bank)
                    setIsEditingBank(true)
                  }}
                  className="group flex items-center gap-2 rounded-lg border bg-background py-1.5 pr-2 pl-3 text-left text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium">{bank.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {countryLabel(bank.country)}
                    {bank.swift_code && ` · ${bank.swift_code}`}
                  </span>
                  <PencilIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>

      <BankAccountForm
        open={open === "account"}
        onOpenChange={(v) => setOpen(v ? "account" : undefined)}
      />
      <BankDetailsForm
        open={open === "bank"}
        onOpenChange={(v) => setOpen(v ? "bank" : undefined)}
      />
      <BankDetailsForm
        key={editingBank?.id}
        initialData={editingBank}
        open={isEditingBank}
        onOpenChange={setIsEditingBank}
      />
    </SettingsPage>
  )
}
