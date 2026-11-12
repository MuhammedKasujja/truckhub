import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { NumberingPatternSchema } from "../schemas"
import { updateEntityNumberPatternsFn } from "../services"
import { previewEntityNumber } from "../entity-number-format"
import { EntityPatternEditor } from "./entity-pattern-editor"
import type { Control } from "react-hook-form"
import type { NumberingEntityKey, NumberingPatternType } from "../schemas"
import { NUMBERING_ENTITIES } from "@/common/constants"
import { useAuth } from "@/components/providers/auth-context"
import { SettingsSaveBar } from "@/features/settings/_components/settings-ui"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

type EntityNumbersEditorProps = {
  patterns: NumberingPatternType
}

export function EntityNumbersEditor({ patterns }: EntityNumbersEditorProps) {
  const queryInvalidator = useQueryInvalidator()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission("config:manage_entity_numbers")

  const form = useForm<NumberingPatternType>({
    resolver: zodResolver(NumberingPatternSchema),
    defaultValues: { entities: patterns.entities },
  })

  // Only the entities the API returned, in the app's usual order.
  const entityKeys = useMemo(
    () =>
      NUMBERING_ENTITIES.filter(
        (key): key is NumberingEntityKey => key in patterns.entities
      ),
    [patterns.entities]
  )
  const [selected, setSelected] = useState<NumberingEntityKey | undefined>(
    entityKeys[0]
  )

  const { dirtyFields, errors, isDirty, isSubmitting } = form.formState
  const isEntityDirty = (key: NumberingEntityKey) =>
    !!dirtyFields.entities?.[key]
  const hasEntityError = (key: NumberingEntityKey) => !!errors.entities?.[key]

  async function onSubmit(updates: NumberingPatternType) {
    const { data, message, error } = await updateEntityNumberPatternsFn({
      data: updates,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(message ?? "Document numbers saved")
    form.reset(data)
    queryInvalidator.settings.numberPatterns.invalidate()
  }

  if (!selected) return null

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (formErrors) => {
        // Jump to the first entity with a problem so the error is visible.
        const first = entityKeys.find((key) => formErrors.entities?.[key])
        if (first) setSelected(first)
      })}
      className="flex flex-col gap-6"
    >
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
        <EntityList
          entityKeys={entityKeys}
          selected={selected}
          onSelect={setSelected}
          control={form.control}
          isDirty={isEntityDirty}
          hasError={hasEntityError}
        />

        {/* Read-only users can browse patterns but not change them. */}
        <fieldset disabled={!canEdit} className="flex min-w-0 flex-1">
          <EntityPatternEditor
            // Remount per entity so the token input ref points at this field.
            key={selected}
            entityKey={selected}
            control={form.control}
            canEdit={canEdit}
            isDirty={isEntityDirty(selected)}
            onReset={() => form.resetField(`entities.${selected}`)}
          />
        </fieldset>
      </div>

      {canEdit && (
        <SettingsSaveBar
          visible={isDirty}
          isSubmitting={isSubmitting}
          onDiscard={() => form.reset()}
          note="New numbers use the saved patterns"
        />
      )}
    </form>
  )
}

function EntityList({
  entityKeys,
  selected,
  onSelect,
  control,
  isDirty,
  hasError,
}: {
  entityKeys: NumberingEntityKey[]
  selected: NumberingEntityKey
  onSelect: (key: NumberingEntityKey) => void
  control: Control<NumberingPatternType>
  isDirty: (key: NumberingEntityKey) => boolean
  hasError: (key: NumberingEntityKey) => boolean
}) {
  const tr = useTranslation()
  const entities = useWatch({ control, name: "entities" })
  const today = useMemo(() => new Date(), [])

  return (
    <nav
      aria-label="Document types"
      className="grid grid-cols-1 gap-1 rounded-xl border bg-card p-1.5 shadow-xs sm:grid-cols-2 lg:w-72 lg:shrink-0 lg:grid-cols-1"
    >
      {entityKeys.map((key) => {
        const entity = entities[key]
        const active = key === selected
        const preview = previewEntityNumber({
          entity: key,
          pattern: entity.pattern,
          padding: entity.counter_padding,
          lastNumber: entity.last_number,
          date: today,
        })

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active && "bg-primary/10 text-primary hover:bg-primary/10"
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                {tr(`settings.entityNumbers.${key}`)}
              </span>
              <span
                className={cn(
                  "block truncate font-mono text-xs text-muted-foreground",
                  active && "text-primary/80"
                )}
              >
                {preview || "No pattern"}
              </span>
            </span>
            {hasError(key) ? (
              <StatusDot className="bg-destructive" label="Has errors" />
            ) : (
              isDirty(key) && (
                <StatusDot className="bg-primary" label="Unsaved changes" />
              )
            )}
          </button>
        )
      })}
    </nav>
  )
}

function StatusDot({ className, label }: { className: string; label: string }) {
  return (
    <span
      className={cn("size-2 shrink-0 rounded-full", className)}
      title={label}
      aria-label={label}
      role="img"
    />
  )
}
