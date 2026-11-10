import type { ReportTemplate, ReportTemplateGroup } from "@/common/constants"
import {
  REPORT_TEMPLATES,
  REPORT_TEMPLATE_GROUPS,
  REPORT_TEMPLATE_META,
} from "@/common/constants"
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox"

type TemplateOption = { value: ReportTemplate; label: string }
type TemplateGroup = { value: ReportTemplateGroup; items: TemplateOption[] }

const OPTIONS: Record<ReportTemplate, TemplateOption> = Object.fromEntries(
  REPORT_TEMPLATES.map((value) => [
    value,
    { value, label: REPORT_TEMPLATE_META[value].label },
  ])
) as Record<ReportTemplate, TemplateOption>

const GROUPS: TemplateGroup[] = REPORT_TEMPLATE_GROUPS.map((group) => ({
  value: group,
  items: REPORT_TEMPLATES.filter(
    (t) => REPORT_TEMPLATE_META[t].group === group
  ).map((t) => OPTIONS[t]),
})).filter((group) => group.items.length > 0)

/** Searchable, grouped list of the document templates. */
export function TemplatePicker({
  value,
  onChange,
}: {
  value: ReportTemplate
  onChange: (template: ReportTemplate) => void
}) {
  return (
    <Combobox
      items={GROUPS}
      value={OPTIONS[value]}
      onValueChange={(option: TemplateOption | null) => {
        if (option) onChange(option.value)
      }}
      itemToStringLabel={(option: TemplateOption) => option.label}
      isItemEqualToValue={(a: TemplateOption, b: TemplateOption) =>
        a.value === b.value
      }
      autoHighlight
    >
      <ComboboxInput
        aria-label="Template"
        placeholder="Search templates…"
        className="w-full sm:w-60"
      />
      <ComboboxContent>
        <ComboboxEmpty>No templates match your search.</ComboboxEmpty>
        <ComboboxList>
          {(group: TemplateGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(option: TemplateOption) => (
                  <ComboboxItem
                    key={option.value}
                    value={option}
                    className="data-selected:bg-primary/10 data-selected:font-medium data-selected:text-primary"
                  >
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
