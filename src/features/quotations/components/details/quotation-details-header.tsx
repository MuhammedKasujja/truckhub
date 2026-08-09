import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { IconAccessPoint, IconFileTypePdf } from "@tabler/icons-react"
import { MailIcon } from "lucide-react"
import { Quotation } from "../../types"
import { Link } from "@tanstack/react-router"
import { useAcceptQuotation } from "../../hooks/use-quotation-actions"

type Props = {
  quotation: Quotation
}

export function QuotationDetailsPageHeader({ quotation }: Props) {
  const handleBack = useBackNavigation()
  const { acceptQuotation } = useAcceptQuotation()
  return (
    <PageHeader className="pb-4">
      <PageTitle>
        Quotation{" "}
        <Badge variant={"outline"}>v{quotation.versions.length}</Badge>
      </PageTitle>
      <PageAction className="flex gap-2">
        <Button variant={"outline"} size={"sm"} onClick={handleBack}>
          Back
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => acceptQuotation(quotation.id)}
        >
          <IconAccessPoint />
          Accept
        </Button>
        <Button variant={"outline"} size={"sm"}>
          <MailIcon />
          Send Email
        </Button>
        <Button variant={"outline"} size={"sm"} asChild>
          <Link
            to="/quotations/$quotationId/pdf"
            params={{ quotationId: quotation.id }}
          >
            <IconFileTypePdf />
            PDF
          </Link>
        </Button>
      </PageAction>
    </PageHeader>
  )
}
