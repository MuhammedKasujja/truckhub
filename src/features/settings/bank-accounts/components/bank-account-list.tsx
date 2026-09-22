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

type Props = {
  accounts: BankAccount[]
}

export function BankAccountList({ accounts }: Props) {
  return (
    <div className="space-y-4">
      {accounts.map((acc) => (
        <Card>
          <CardHeader>
            <CardTitle>{acc.purpose}</CardTitle>
            <CardDescription>{acc.bank.name}</CardDescription>
            <CardAction>
              <Badge variant={acc.is_active ? "default" : "destructive"}>
                {acc.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <div>
              .... {acc.account_number.slice(-4)} {acc.currency}
            </div>
            <div className="flex gap-2">
              <Button size={"icon-sm"} variant={"outline"}>
                <ActionIcon action="view" />
              </Button>
              <Button size={"icon-sm"} variant={"outline"}>
                <ActionIcon action="edit" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
