import type { Gender } from "./types"

/**
 * An existing record a staff member is being created from. The new staff
 * record is linked to it; the user or driver itself isn't changed.
 */
export type StaffSource =
  | { kind: "user"; id: string; name: string }
  | { kind: "driver"; id: string; name: string }

/** The staff form fields a source record can fill in. */
export type StaffPrefill = {
  first_name: string
  last_name: string
  email: string
  phone: string
  gender?: Gender | null
  date_of_birth?: string | null
  national_id?: string
  user_id?: string
  driver_id?: string
}

type UserLike = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
}

type DriverLike = {
  id: string
  full_name: string
  email: string
  phone?: string | null
  gender?: string | null
  date_of_birth?: string | null
  national_id?: string | null
}

export function staffValuesFromUser(user: UserLike): StaffPrefill {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone ?? "",
    user_id: user.id,
  }
}

/** Drivers have one name field: the first word is the first name, the rest the last. */
export function splitFullName(fullName: string) {
  const [first = "", ...rest] = (fullName ?? "").trim().split(/\s+/)
  return { first_name: first, last_name: rest.join(" ") }
}

export function staffValuesFromDriver(driver: DriverLike): StaffPrefill {
  const gender = driver.gender?.toLowerCase()
  return {
    ...splitFullName(driver.full_name),
    email: driver.email,
    phone: driver.phone ?? "",
    // Staff gender is male or female; anything else is left for HR to choose
    gender: gender === "male" || gender === "female" ? gender : null,
    // "2000-05-17T00:00:00" → "2000-05-17"
    date_of_birth: driver.date_of_birth?.slice(0, 10) || null,
    national_id: driver.national_id ?? "",
    driver_id: driver.id,
  }
}
