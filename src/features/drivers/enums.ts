/** Ordered lowest to highest. */
export const EDUCATION_LEVELS = [
  "primary",
  "o_level",
  "o_level_with_driving_course",
  "a_level",
  "diploma",
  "degree",
] as const
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

export const TEST_STATUSES = ["pending", "passed", "failed"] as const
export type TestStatus = (typeof TEST_STATUSES)[number]

/** Reasons staff can pick when changing a licence. "initial" is set by registration only. */
export const LICENSE_CHANGE_REASONS = [
  "renewal",
  "replacement",
  "category_change",
  "correction",
] as const

export type LicenseChangeReason =
  | "initial"
  | (typeof LICENSE_CHANGE_REASONS)[number]
