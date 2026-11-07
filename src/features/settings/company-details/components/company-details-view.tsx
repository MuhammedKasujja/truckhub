import { useState } from "react"
import {
  Building2,
  ExternalLink,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react"
import { DetailItem, MissingValue } from "../../_components/settings-ui"
import { EditCompanyDetailsDialog } from "./edit-company-details-dialog"
import type { Company } from "../../schemas"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"

type CompanyDetailsProps = {
  company: Company
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

function websiteHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function CompanyDetailsView({ company }: CompanyDetailsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-4 border-b bg-muted/30 px-5 py-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold tracking-tight text-primary-foreground shadow-sm">
            {initials(company.name) || <Building2 className="size-7" />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Company profile
            </p>
            <h2 className="truncate text-xl font-bold tracking-tight">
              {company.name}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {company.description ||
                "Shown on invoices, quotations and other documents you send."}
            </p>
          </div>
          <Can permission="config:company:update">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(true)}
            >
              <PencilIcon />
              Edit details
            </Button>
          </Can>
        </div>

        {/* Contact */}
        <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
          <DetailItem icon={PhoneIcon} label="Phone">
            {company.phone ? (
              <span className="flex flex-col">
                <a href={`tel:${company.phone}`} className="hover:underline">
                  {company.phone}
                </a>
                {company.phone_2 && (
                  <a
                    href={`tel:${company.phone_2}`}
                    className="font-normal text-muted-foreground hover:underline"
                  >
                    {company.phone_2}
                  </a>
                )}
              </span>
            ) : (
              <MissingValue />
            )}
          </DetailItem>
          <DetailItem icon={MailIcon} label="Email">
            {company.email ? (
              <span className="flex flex-col">
                <a href={`mailto:${company.email}`} className="hover:underline">
                  {company.email}
                </a>
                {company.email_2 && (
                  <a
                    href={`mailto:${company.email_2}`}
                    className="font-normal text-muted-foreground hover:underline"
                  >
                    {company.email_2}
                  </a>
                )}
              </span>
            ) : (
              <MissingValue />
            )}
          </DetailItem>
          <DetailItem icon={MapPinIcon} label="Address">
            {company.address || <MissingValue />}
          </DetailItem>
          <DetailItem icon={GlobeIcon} label="Website">
            {company.website ? (
              <a
                href={websiteHref(company.website)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {company.website.replace(/^https?:\/\//i, "")}
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <MissingValue />
            )}
          </DetailItem>
        </div>
      </section>

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
