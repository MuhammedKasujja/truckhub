import React from "react"
import { MaskInput, MaskPattern } from "../mask-input"
import { PLATE_REGEX } from "@/common/constants"

/** Keeps only input that fits LL DDD LL or LLL DDD L, in that order. */
function normalizePlate(raw: string): string {
  const clean = (raw ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase()

  const letters = clean.match(/^[A-Z]{0,3}/)![0]
  const afterLetters = clean.slice(letters.length)

  const digits = afterLetters.match(/^\d{0,3}/)![0]
  const afterDigits = afterLetters.slice(digits.length)

  // trailing letters only allowed once all 3 digits are in
  const tail =
    digits.length === 3
      ? afterDigits.match(/^[A-Z]*/)![0].slice(0, 4 - letters.length)
      : ""

  return letters + digits + tail
}

function usePlateMask(value: string): MaskPattern {
  const unmasked = normalizePlate(value)

  return React.useMemo(() => {
    const leadingLetters = /^[A-Z]{3}/.test(unmasked) ? 3 : 2
    const trailingSlots = 4 - leadingLetters // 2 or 1

    return {
      pattern:
        "#".repeat(leadingLetters) + " " + "###" + "#".repeat(trailingSlots),
      transform: normalizePlate,
      validate: (v: string) => PLATE_REGEX.test(v),
    }
  }, [unmasked])
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
      value={field.value ?? ""}
      onValueChange={(masked) => field.onChange(masked)}
      onBlur={field.onBlur}
      invalid={invalid}
      readOnly={readOnly}
    />
  )
}
