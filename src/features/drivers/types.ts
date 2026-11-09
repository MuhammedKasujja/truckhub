import { EntityId } from "@/schemas"
import { VehicleType } from "./components/driver-options"
import { VehicleSummary } from "@/features/vehicles/types"
import { DriverDocument } from "./driver-registration-mock"
import {
  TestType,
  TestStatus,
  HealthCondition,
  LicenseChangeReason,
} from "./enums"

export type DriverRow = {
  id: EntityId
  number: string
  full_name: string
  user_name: string | undefined
  phone: string | undefined
  national_id: string
  date_of_birth: string
  email: string
  rating: number
  created_at: Date
  updated_at: Date
  vehicle: VehicleSummary | null
  photo_url: string | undefined
}

export interface Driver {
  id: EntityId
  full_name: string
  phone: string
  email: string
  user_name: string | null
  number: string | null
  national_id: string
  gender: string | null
  vehicle: VehicleSummary | null
  vehicle_types: { vehicle_type: VehicleType; years_experience: number }[]
  created_at: string
  date_of_birth: string
  education: string
  is_smoker: boolean
  is_drug_user: boolean
  photo_url: string | null
  license: LicenseRead // the current licence
  license_history: LicenseRead[] // earlier licences, newest first
  license_coverage_gaps: VehicleType[] // assigned types the current licence does not cover
  health_screening: {
    driver_confirmed: boolean
    responses: {
      condition: HealthCondition
      answer: boolean
      details: string | null
    }[]
  }
  tests: {
    test_type: TestType
    status: TestStatus
    tested_on: string | null
    notes: string | null
  }[]
  documents: DriverDocument[] // every version; filter on isCurrent
}

export interface LicenseRead {
  id: number
  license_number: string
  license_classes: VehicleType[]
  expiry_date: string
  is_current: boolean
  effective_from: string
  ended_on: string | null
  change_reason: LicenseChangeReason
  notes: string | null
  copy_document_id: number | null // id of the photocopy in documents
}
