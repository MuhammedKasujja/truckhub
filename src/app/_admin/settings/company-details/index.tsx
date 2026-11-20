import { createFileRoute } from "@tanstack/react-router"
import {
  Building2,
  FileSignature,
  ScrollText,
  TriangleAlert,
} from "lucide-react"
import { Can } from "@/components/has-permission"
import { EditTermsDialog } from "@/features/settings/_components"
import {
  SectionEmpty,
  SettingsPage,
  SettingsPageHeader,
  SettingsPageSkeleton,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { CompanyDetailsView } from "@/features/settings/company-details/components"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { settingsQueryOptions } from "@/features/settings/query-options"
import { formatPlural } from "@/lib/format"

export const Route = createFileRoute("/_admin/settings/company-details/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(settingsQueryOptions()),
})

function RouteComponent() {
  const { settings, error, isLoading } = useSettings()

  if (isLoading) {
    return <SettingsPageSkeleton sections={2} />
  }

  if (error || !settings) {
    return (
      <SettingsPage>
        <SectionEmpty
          icon={TriangleAlert}
          title="Couldn't load company details"
          description={error?.message ?? "Refresh the page to try again."}
        />
      </SettingsPage>
    )
  }

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={Building2}
        title="Company details"
        description="Your company's contact details and the terms printed on the documents you send to clients."
      />

      <CompanyDetailsView company={settings.company} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TermsSection
          kind="invoice"
          icon={ScrollText}
          title="Invoice terms"
          description="Printed at the bottom of every invoice"
          terms={settings.invoice_terms ?? []}
        />
        <TermsSection
          kind="quotation"
          icon={FileSignature}
          title="Quotation terms"
          description="Printed at the bottom of every quotation"
          terms={settings.quotation_terms ?? []}
        />
      </div>
    </SettingsPage>
  )
}

function TermsSection({
  kind,
  icon,
  title,
  description,
  terms,
}: {
  kind: "invoice" | "quotation"
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  terms: string[]
}) {
  return (
    <SettingsSection
      icon={icon}
      title={title}
      description={`${description} · ${formatPlural(terms.length, { singular: "term", plural: "terms" })}`}
      action={
        <Can permission="config:payment_terms:edit">
          {/* key: start from the latest saved terms after a refetch */}
          <EditTermsDialog key={terms.join("\n")} kind={kind} terms={terms} />
        </Can>
      }
    >
      {terms.length === 0 ? (
        <SectionEmpty
          icon={icon}
          title="No terms yet"
          description="Documents will be sent without terms until you add some."
          className="py-8"
        />
      ) : (
        <ol className="space-y-3">
          {terms.map((term, index) => (
            <li key={`${index}-${term}`} className="flex gap-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <p className="leading-5 text-foreground/90">{term}</p>
            </li>
          ))}
        </ol>
      )}
    </SettingsSection>
  )
}
