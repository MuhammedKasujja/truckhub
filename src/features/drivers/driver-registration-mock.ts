/**
 * TEMPORARY: sample registration data for the driver details screen.
 *
 * The driver API only returns name, phone, email, licence number and the
 * assigned vehicle so far. Everything else captured at registration
 * (vehicle types, licence classes, health screening, tests, documents)
 * comes from here until the API returns it. Delete this file and pass the
 * real record to <DriverDetails registration={...} /> once it does.
 */
import type { Driver } from "./types"
import type { DriverCreateSchemaType } from "./schemas"

export type DriverDocument = {
  name: string
  /** Bytes. */
  size: number
  uploaded_at: string
  url?: string
}

/** What registration captured, as the details screen shows it. */
export type DriverRegistrationRecord = Omit<
  DriverCreateSchemaType,
  "avatar" | "license_copy" | "signed_questionnaire"
> & {
  yard_name: string
  license_copy?: DriverDocument
  signed_questionnaire?: DriverDocument
  registered_by: string
  registered_at: string
}

const SAMPLE: DriverRegistrationRecord = {
  full_name: "John M. Okello",
  phone: "+256 776 123 456",
  email: "john.okello@truckhub.com",
  national_id: "CM90012345ABCD",
  date_of_birth: "1990-03-12",
  yard_id: 1,
  yard_name: "Seeta-Mukono",
  vehicle_types: [
    { vehicle_type: "truck", years_experience: 6 },
    { vehicle_type: "pickup_van", years_experience: 4 },
    { vehicle_type: "minibus", years_experience: 2 },
  ],
  education: "o_level_driving_course",
  is_smoker: false,
  is_drug_user: false,
  license_number: "UGA/DL/1234567",
  license_classes: ["truck", "pickup_van", "car"],
  license_expiry: "2028-04-15",
  health: {
    vision: { answer: true, details: "Wears prescription glasses for driving." },
    serious_illness: { answer: false, details: null },
    neuro_musculoskeletal: { answer: false, details: null },
    sudden_collapse: { answer: false, details: null },
    anxiety_depression: { answer: false, details: null },
    medication: {
      answer: true,
      details: "Blood pressure tablets, once a day. No drowsiness reported.",
    },
    stress_sleep: { answer: false, details: null },
  },
  drug_alcohol_test: "passed",
  skills_test: "passed",
  practical_test: "pending",
  driver_confirmed: true,
  license_copy: {
    name: "licence-UGA-DL-1234567.pdf",
    size: 842_000,
    uploaded_at: "2026-10-02T09:14:00Z",
  },
  signed_questionnaire: undefined,
  registered_by: "Muhammed K.",
  registered_at: "2026-10-02T09:20:00Z",
}

/** Sample record, using the driver's real details wherever the API has them. */
export function getMockDriverRegistration(
  driver: Driver
): DriverRegistrationRecord {
  const fullName =
    driver.fullname ||
    [driver.first_name, driver.last_name].filter(Boolean).join(" ")
  return {
    ...SAMPLE,
    full_name: fullName || SAMPLE.full_name,
    phone: driver.phone || SAMPLE.phone,
    email: driver.email || SAMPLE.email,
    license_number: driver.licence_number || SAMPLE.license_number,
  }
}
