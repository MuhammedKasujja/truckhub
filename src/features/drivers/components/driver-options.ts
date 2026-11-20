/**
 * Option codes stored for a driver, and their display labels. Forms and the
 * API use the codes; only the UI shows the labels.
 */

export const VEHICLE_TYPES = [
  // "motorcycle",
  "car",
  "pickup_van",
  "minibus",
  "truck",
  // "bus",
] as const

export const EDUCATION_LEVELS = [
  "primary",
  "o_level",
  "o_level_driving_course",
  "a_level",
  "diploma",
  "degree",
] as const

export const TEST_STATUSES = ["pending", "passed", "failed"] as const

export type VehicleType = (typeof VEHICLE_TYPES)[number]
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]
export type TestStatus = (typeof TEST_STATUSES)[number]

const LABELS = {
  vehicleType: {
    // motorcycle: "Motorcycle",
    car: "Car",
    pickup_van: "Pickup / Van",
    minibus: "Minibus",
    truck: "Truck",
    // bus: "Bus",
  },
  education: {
    primary: "Primary",
    o_level: "O'Level",
    o_level_driving_course: "O'Level with a driving course",
    a_level: "A'Level",
    diploma: "Diploma",
    degree: "Degree",
  },
  testStatus: {
    pending: "Pending",
    passed: "Passed",
    failed: "Failed",
  },
} as const satisfies {
  vehicleType: Record<VehicleType, string>
  education: Record<EducationLevel, string>
  testStatus: Record<TestStatus, string>
}

export type OptionKind = keyof typeof LABELS

/** Display label for a code; falls back to the code itself. */
export function labelFor(kind: OptionKind, code: string | undefined | null) {
  if (!code) return ""
  const labels: Partial<Record<string, string>> = LABELS[kind]
  return labels[code] ?? code
}

/** `{ value, label }` pairs for selects and segmented controls. */
export function toOptions(kind: OptionKind, codes: readonly string[]) {
  return codes.map((value) => ({ value, label: labelFor(kind, value) }))
}
