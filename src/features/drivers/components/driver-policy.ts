/**
 * Registration rules that live in system settings rather than in code, so
 * the form never hard-codes age or experience limits.
 */
export type DriverPolicy = {
  /** Youngest age allowed at registration. */
  minAge: number
  /** Oldest age allowed at registration. */
  maxAge: number
  /** Minimum years of experience on each vehicle type the driver drives. */
  minExperienceYears: number
}

/**
 * Used until the settings are loaded, and wherever a page doesn't pass a
 * policy. These match the limits the form used before they moved to settings.
 */
export const DEFAULT_DRIVER_POLICY: DriverPolicy = {
  minAge: 25,
  maxAge: 55,
  minExperienceYears: 2,
}
