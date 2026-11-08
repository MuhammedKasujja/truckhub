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
import type { DriverCreatePayload } from "./components/driver-registration-form"

export type DriverDocument = {
  name: string
  /** Bytes. */
  size: number
  uploadedAt: string
  url?: string
}

/** What registration captured, as the details screen shows it. */
export type DriverRegistrationRecord = DriverCreatePayload & {
  yardName: string
  email?: string
  licenseCopy?: DriverDocument
  signedQuestionnaire?: DriverDocument
  registeredBy: string
  registeredAt: string
}

const SAMPLE: DriverRegistrationRecord = {
  fullName: "John M. Okello",
  phone: "+256 776 123 456",
  email: "john.okello@truckhub.com",
  nationalId: "CM90012345ABCD",
  dateOfBirth: "1990-03-12",
  yardId: 1,
  yardName: "Seeta-Mukono",
  vehicleTypes: [
    { vehicleType: "truck", yearsExperience: 6 },
    { vehicleType: "pickup_van", yearsExperience: 4 },
    { vehicleType: "minibus", yearsExperience: 2 },
  ],
  education: "o_level_driving_course",
  isSmoker: false,
  isDrugUser: false,
  licenseNumber: "UGA/DL/1234567",
  licenseClasses: ["truck", "pickup_van", "car"],
  licenseExpiry: "2028-04-15",
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
  drugAlcoholTest: "passed",
  skillsTest: "passed",
  practicalTest: "pending",
  driverConfirmed: true,
  licenseCopy: {
    name: "licence-UGA-DL-1234567.pdf",
    size: 842_000,
    uploadedAt: "2026-10-02T09:14:00Z",
  },
  signedQuestionnaire: undefined,
  registeredBy: "Muhammed K.",
  registeredAt: "2026-10-02T09:20:00Z",
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
    fullName: fullName || SAMPLE.fullName,
    phone: driver.phone || SAMPLE.phone,
    email: driver.email || SAMPLE.email,
    licenseNumber: driver.licence_number || SAMPLE.licenseNumber,
  }
}
