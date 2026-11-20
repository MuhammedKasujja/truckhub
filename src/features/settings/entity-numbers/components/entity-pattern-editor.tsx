import { useMemo } from "react"
import { Controller, useWatch } from "react-hook-form"
import { Hash, Plus, RotateCcw, TriangleAlert } from "lucide-react"
import { useTokenInsertion } from "../hooks/use-token-insertion"
import {
  COUNTER_TOKEN,
  TOKEN_DESCRIPTIONS,
  findUnknownTokens,
  padCounter,
  previewEntityNumber,
} from "../entity-number-format"
import type { Control } from "react-hook-form"
import type { NumberingEntityKey, NumberingPatternType } from "../schemas"
import {
  ALLOWDED_NUMBER_COUNTER_PATTERNS,
  ENTITY_NUMBER_PATTERNS,
} from "@/common/constants"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsSection } from "@/features/settings/_components/settings-ui"
import { useTranslation } from "@/i18n"

type EntityPatternEditorProps = {
  entityKey: NumberingEntityKey
  control: Control<NumberingPatternType>
  isDirty: boolean
  canEdit: boolean
  onReset: () => void
}

export function EntityPatternEditor({
  entityKey,
  control,
  isDirty,
  canEdit,
  onReset,
}: EntityPatternEditorProps) {
  const tr = useTranslation()
  const { inputRef, insertToken } = useTokenInsertion()
  const label = tr(`settings.entityNumbers.${entityKey}`)
  const today = useMemo(() => new Date(), [])

  const values = useWatch({ control, name: `entities.${entityKey}` })
  const pattern = values.pattern
  const padding = values.counter_padding
  const lastNumber = values.last_number

  const preview = previewEntityNumber({
    entity: entityKey,
    pattern,
    padding,
    lastNumber,
    date: today,
  })
  const unknownTokens = findUnknownTokens(entityKey, pattern)
  const missingCounter = pattern.length > 0 && !pattern.includes(COUNTER_TOKEN)

  return (
    <SettingsSection
      icon={Hash}
      title={`${label} numbers`}
      description={`How new ${label.toLowerCase()} numbers are built`}
      action={
        canEdit && isDirty ? (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw />
            Reset
          </Button>
        ) : undefined
      }
      className="min-w-0 flex-1"
    >
      <div className="space-y-6">
        {/* Live preview */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3.5">
          <p className="text-xs text-muted-foreground">
            Next {label.toLowerCase()} number
          </p>
          <p className="mt-0.5 font-mono text-xl font-semibold tracking-tight break-all tabular-nums">
            {preview || (
              <span className="font-sans text-base font-normal text-muted-foreground">
                Enter a pattern
              </span>
            )}
          </p>
        </div>

        <Controller
          name={`entities.${entityKey}.pattern`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Pattern</FieldLabel>
              <Input
                {...field}
                ref={(el) => {
                  field.ref(el)
                  inputRef.current = el
                }}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                placeholder="INV-{year}-{counter}"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Mix your own text with the tokens below. Tokens are replaced
                  when a number is issued.
                </FieldDescription>
              )}

              {canEdit && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Insert a token at the cursor
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ENTITY_NUMBER_PATTERNS[entityKey].map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() =>
                          insertToken(token, field.value, field.onChange)
                        }
                        className="group inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-left transition-colors outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <Plus className="size-3 text-muted-foreground group-hover:text-primary" />
                        <span className="font-mono text-xs">{token}</span>
                        {TOKEN_DESCRIPTIONS[token] && (
                          <span className="text-xs text-muted-foreground">
                            {TOKEN_DESCRIPTIONS[token]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Field>
          )}
        />

        {(missingCounter || unknownTokens.length > 0) && (
          <ul className="space-y-1.5">
            {missingCounter && (
              <PatternWarning>
                Add <code className="font-mono">{COUNTER_TOKEN}</code> so every{" "}
                {label.toLowerCase()} gets a different number.
              </PatternWarning>
            )}
            {unknownTokens.length > 0 && (
              <PatternWarning>
                {unknownTokens.map((token, i) => (
                  <span key={token}>
                    {i > 0 && ", "}
                    <code className="font-mono">{token}</code>
                  </span>
                ))}{" "}
                {unknownTokens.length === 1 ? "isn't a token" : "aren't tokens"}{" "}
                for {label.toLowerCase()} numbers and will be printed as typed.
              </PatternWarning>
            )}
          </ul>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name={`entities.${entityKey}.counter_padding`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Counter digits</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!canEdit}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWDED_NUMBER_COUNTER_PATTERNS.map((digits) => (
                      <SelectItem key={digits} value={String(digits)}>
                        <span className="font-mono tabular-nums">
                          {padCounter(1, digits)}
                        </span>
                        <span className="text-muted-foreground">
                          {digits === 1 ? "No padding" : `${digits} digits`}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>
                    Shorter counters are padded with zeros.
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Last number issued</p>
            <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 font-mono text-sm tabular-nums">
              {lastNumber ? (
                padCounter(lastNumber, padding)
              ) : (
                <span className="font-sans text-muted-foreground">
                  None yet
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              The counter continues from here.
            </p>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

function PatternWarning({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
      <TriangleAlert className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </li>
  )
}
