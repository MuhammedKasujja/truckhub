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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Company } from "../../schemas"
import { EditCompanyDetailsDialog } from "./edit-company-details-dialog"
import {
  GlobeIcon,
  MailIcon,
  MapPinHouseIcon,
  PhoneIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ActionIcon } from "@/components/icons"

type CompanyDetailsProps = {
  company: Company
}

export function CompanyDetailsView({ company }: CompanyDetailsProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {company.name}
          </CardTitle>
          <CardAction>
            <Can permission="config:company:update">
              <Button
                type="button"
                size={"icon"}
                onClick={() => setIsOpen(true)}
              >
                <ActionIcon action={"edit"} />
              </Button>
            </Can>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Item>
            <ItemMedia variant="icon">
              <PhoneIcon />
            </ItemMedia>
            <ItemContent>
              <ItemDescription>Phone</ItemDescription>
              <ItemTitle>{company.phone ?? "-"}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemMedia variant="icon">
              <MailIcon />
            </ItemMedia>
            <ItemContent>
              <ItemDescription>Email</ItemDescription>
              <ItemTitle>{company.email ?? "-"}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemMedia variant="icon">
              <MapPinHouseIcon />
            </ItemMedia>
            <ItemContent>
              <ItemDescription>Address</ItemDescription>
              <ItemTitle>{company.address ?? "-"}</ItemTitle>
            </ItemContent>
          </Item>
          <Item>
            <ItemMedia variant="icon">
              <GlobeIcon />
            </ItemMedia>
            <ItemContent>
              <ItemDescription>Website</ItemDescription>
              <ItemTitle>{company.website ?? "-"}</ItemTitle>
            </ItemContent>
          </Item>
        </CardContent>
      </Card>
      {isOpen && (
        <Can permission="config:company:update">
          <EditCompanyDetailsDialog
            company={company}
            isOpen={isOpen}
            onOpenChanged={setIsOpen}
          />
        </Can>
      )}
    </>
  )
}
