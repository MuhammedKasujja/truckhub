import { isCustomTemplate } from "../utils"
import type { EmailTemplate } from "../types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = {
  templates: EmailTemplate[]
  selectedKey?: string
  onSelect: (key: string) => void
}

export function EmailTemplateList({ templates, selectedKey, onSelect }: Props) {
  const system = templates.filter((t) => !isCustomTemplate(t.key))
  const custom = templates.filter((t) => isCustomTemplate(t.key))

  return (
    <nav aria-label="Email templates" className="flex flex-col gap-5">
      <TemplateGroup
        title="Sent by the system"
        templates={system}
        selectedKey={selectedKey}
        onSelect={onSelect}
      />
      {custom.length > 0 && (
        <TemplateGroup
          title="Custom"
          templates={custom}
          selectedKey={selectedKey}
          onSelect={onSelect}
        />
      )}
    </nav>
  )
}

function TemplateGroup({
  title,
  templates,
  selectedKey,
  onSelect,
}: Props & { title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {templates.map((template) => {
        const selected = template.key === selectedKey
        return (
          <button
            key={template.key}
            type="button"
            onClick={() => onSelect(template.key)}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
              selected
                ? "border-primary/40 bg-primary/5"
                : "border-transparent hover:bg-muted"
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{template.name}</span>
              <TemplateStatus template={template} />
            </span>
            <code className="truncate font-mono text-xs text-muted-foreground">
              {template.key}
            </code>
          </button>
        )
      })}
    </div>
  )
}

function TemplateStatus({ template }: { template: EmailTemplate }) {
  if (!template.is_active) return <Badge variant="outline">Off</Badge>
  if (template.customized && !isCustomTemplate(template.key)) {
    return <Badge>Customized</Badge>
  }
  if (!template.customized) return <Badge variant="secondary">Default</Badge>
  return null
}
