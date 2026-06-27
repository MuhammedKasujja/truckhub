import { Can } from "@/components/has-permission"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Company } from "../../schemas"
import { EditCompanyDetailsDialog } from "./edit-company-details-dialog"

type CompanyDetailsProps = {
  company: Company
}

export function CompanyDetailsView({ company }: CompanyDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{company.name}</CardTitle>
        <CardAction>
          <Can permission="config:company:update">
            <EditCompanyDetailsDialog company={company} />
          </Can>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Item>
          <ItemContent>
            <ItemDescription>Phone</ItemDescription>
            <ItemTitle>{company.phone ?? "-"}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Email</ItemDescription>
            <ItemTitle>{company.email ?? "-"}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Address</ItemDescription>
            <ItemTitle>{company.address ?? "-"}</ItemTitle>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent>
            <ItemDescription>Website</ItemDescription>
            <ItemTitle>{company.website ?? "-"}</ItemTitle>
          </ItemContent>
        </Item>
      </CardContent>
    </Card>
  )
}
