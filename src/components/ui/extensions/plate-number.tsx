import React from "react"
import { MaskInput, MaskPattern } from "../mask-input"

function usePlateMask(unmaskedValue: string): MaskPattern {
  return React.useMemo(() => {
    const digitIndex = unmaskedValue.search(/\d/)
    // letters typed before the first digit — cap at 3 (max leading-letter format)
    const leadingLetters =
      digitIndex === -1
        ? Math.min(unmaskedValue.length, 3)
        : Math.min(digitIndex, 3)

    // 4 letters + 3 digits = 7 chars total, always
    const trailingSlots = Math.max(4 - leadingLetters, 0)

    const pattern =
      "#".repeat(leadingLetters) + " " + "###" + "#".repeat(trailingSlots)

    return {
      pattern,
      transform: (value: string) =>
        value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      validate: (value: string) =>
        /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(value) ||
        /^[A-Z]{3}\d{3}[A-Z]$/.test(value),
    }
  }, [unmaskedValue])
}

export function PlateNumber({
  field,
  invalid,
  id,
  readOnly,
}: {
  field: { value: string; onChange: (v: string) => void; onBlur: () => void }
  invalid: boolean
  readOnly: boolean
  id?: string
}) {
  const plateMask = usePlateMask(field.value ?? "")

  return (
    <MaskInput
      id={id}
      mask={plateMask}
      placeholder="UA 567PL or UAN 789K"
      value={field.value}
      onValueChange={(_masked, unmasked) => field.onChange(unmasked)}
      onBlur={field.onBlur}
      invalid={invalid}
      readOnly={readOnly}
    />
  )
}
