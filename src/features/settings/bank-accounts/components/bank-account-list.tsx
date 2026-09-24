import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BankAccount } from "../types"
import { Button } from "@/components/ui/button"
import { ActionIcon } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { BankAccountForm } from "./bank-account-form"

type Props = {
  accounts: BankAccount[]
}

export function BankAccountList({ accounts }: Props) {
  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <BankAccountListItem key={account.id} account={account} />
      ))}
    </div>
  )
}

function BankAccountListItem({ account }: { account: BankAccount }) {
  const [open, setOpen] = useState<"bank" | "account">()
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{account.purpose}</CardTitle>
          <CardDescription>{account.bank.name}</CardDescription>
          <CardAction>
            <Badge variant={account.is_active ? "default" : "destructive"}>
              {account.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <div>
            .... {account.account_number.slice(-4)} {account.currency}
          </div>
          <div className="flex gap-2">
            <Button size={"icon-sm"} variant={"outline"}>
              <ActionIcon action="view" />
            </Button>
            <Button
              size={"icon-sm"}
              variant={"outline"}
              onClick={() => setOpen("account")}
            >
              <ActionIcon action="edit" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <BankAccountForm
        key={account.id}
        initialData={account}
        open={open == "account"}
        onOpenChange={() => setOpen(undefined)}
      />
    </>
  )
}
