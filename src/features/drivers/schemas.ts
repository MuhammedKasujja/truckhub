import z from "zod"
import {
  labelFor,
  TEST_STATUSES,
  VEHICLE_TYPES,
  EDUCATION_LEVELS,
} from "./components/driver-options"
import { IDSchema, ImageSchema } from "@/schemas"
import { LIST_VIEWS } from "@/components/view-toggle"
import type { DriverRow } from "@/features/drivers/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import type { VehicleType } from "./components/driver-options"
import type { DriverPolicy } from "./components/driver-policy"
import { SUPPORTED_IMAGE_EXTENSIONS } from "@/config/constants"
import { DEFAULT_DRIVER_POLICY } from "./components/driver-policy"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILES = ["image/jpeg", "image/png", "application/pdf"]

// A non-fatal file check: `z.instanceof` aborts the parse when it fails,
// which would also stop the cross-field checks below from running.
const fileSchema = (
  message: string,
  accepted: readonly string[] = ACCEPTED_FILES,
  acceptedMessage = "Upload a JPG, PNG or PDF"
) =>
  z.custom<File>().superRefine((v, ctx) => {
    if (!(v instanceof File)) {
      ctx.addIssue({ code: "custom", message })
    } else if (v.size > MAX_FILE_SIZE) {
      ctx.addIssue({ code: "custom", message: "File must be 5MB or smaller" })
    } else if (!accepted.includes(v.type)) {
      ctx.addIssue({ code: "custom", message: acceptedMessage })
    }
  })

const licenseCopyFile = fileSchema("Upload a photocopy of the licence")

const signedQuestionnaireFile = fileSchema("Upload a file")

const testStatus = z.enum(TEST_STATUSES)

/** Body for creating a driver. The form applies the policy limits before this. */
export const DriverCreateSchema = z.object({
  full_name: z.string("Required").trim().min(2, "Too short"),
  phone: z.string("Required").trim().min(9, "Too short"),
  email: z.email("Enter a valid email address"),
  avatar: ImageSchema.optional(),
  national_id: z.string("Required").trim().min(5, "Too short"),
  date_of_birth: z.string("Required").min(1, "Required"),
  /** Omitted while no yards are set up. */
  yard_id: z.number().int().positive().optional(),
  vehicle_types: z
    .array(
      z.object({
        vehicle_type: z.enum(VEHICLE_TYPES),
        years_experience: z.number().min(0),
      })
    )
    .min(1, "Add at least one vehicle type"),
  education: z.enum(EDUCATION_LEVELS),
  is_smoker: z.boolean(),
  is_drug_user: z.boolean(),
  license_number: z.string("Required").trim().min(3, "Too short"),
  license_classes: z
    .array(z.enum(VEHICLE_TYPES))
    .min(1, "Select at least one licence category"),
  license_expiry: z.string("Required").min(1, "Required"),
  /** Keyed by health condition code, e.g. "serious_illness". */
  health: z.record(
    z.string(),
    z.object({ answer: z.boolean(), details: z.string().nullable() })
  ),
  drug_alcohol_test: testStatus,
  skills_test: testStatus,
  practical_test: testStatus,
  driver_confirmed: z.boolean(),
  license_copy: licenseCopyFile,
  signed_questionnaire: signedQuestionnaireFile.optional(),
})

export const DriverUpdateSchema = z.object({
  id: IDSchema,
  ...DriverCreateSchema.partial().shape,
})

export type DriverCreateSchemaType = z.infer<typeof DriverCreateSchema>

export type DriverUpdateSchemaType = z.infer<typeof DriverUpdateSchema>

export const DriverSearchParamsCache = z.object({
  sort: getSortingStateSchema<DriverRow>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<DriverRow>().optional(),
  /** List layout; UI only, never sent to the API. Cards when absent. */
  view: z.enum(LIST_VIEWS).optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type DriverListSearchParams = z.infer<typeof DriverSearchParamsCache>

/* ------------------------------------------------------------------ */
/* Registration form                                                   */
/* ------------------------------------------------------------------ */


export const HEALTH_QUESTIONS = [
  {
    name: "vision",
    label:
      "Does the driver have vision problems (eyesight or colour blindness)?",
  },
  {
    name: "seriousIllness",
    label: "Does the driver have any serious illness?",
  },
  {
    name: "neuroMusculoskeletal",
    label:
      "Does the driver have a neurological or musculoskeletal condition that could affect movement and reaction time?",
  },
  {
    name: "suddenCollapse",
    label:
      "Does the driver have a condition that could cause sudden collapse (e.g. epilepsy, diabetes, heart attack)?",
  },
  {
    name: "anxietyDepression",
    label: "Does the driver have a history of anxiety or depression?",
  },
  { name: "medication", label: "Does the driver use any medication?" },
  {
    name: "stressSleep",
    label: "Does the driver have stress or sleeping disorders?",
  },
] as const

/** Vehicle types the driver is down for that the licence doesn't cover. */
export function uncoveredVehicleTypes(
  vehicleTypes: readonly (VehicleType | undefined)[],
  licenseCategories: readonly VehicleType[] | undefined
) {
  const covered = new Set(licenseCategories ?? [])
  return [
    ...new Set(
      vehicleTypes.filter((t): t is VehicleType => !!t && !covered.has(t))
    ),
  ]
}

const yesNo = z.enum(["yes", "no"], { message: "Please answer this question" })

export const ageOn = (dob: string, on = new Date()) => {
  const d = new Date(dob)
  let age = on.getFullYear() - d.getFullYear()
  const m = on.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--
  return age
}

const healthShape = Object.fromEntries(
  HEALTH_QUESTIONS.flatMap((q) => [
    [q.name, yesNo],
    [`${q.name}Details`, z.string().optional()],
  ])
) as Record<string, z.ZodTypeAny>

export type DriverFormMode = "create" | "edit"

/**
 * Builds the schema from the current system settings, so age and experience
 * limits are never hard-coded. In edit mode the licence copy is already in
 * the driver's portfolio, so a new upload is optional.
 */
export function buildDriverSchema(
  policy: DriverPolicy = DEFAULT_DRIVER_POLICY,
  mode: DriverFormMode = "create",
  /**
   * Off when no yards are set up yet, so registration isn't blocked by a
   * missing list; the payload then leaves `yardId` out.
   */
  { requireYard = true }: { requireYard?: boolean } = {}
) {
  const yardId = z
    .number({ message: "Select the yard" })
    .int()
    .positive("Select the yard")
  return z
    .object({
      // Optional. null means the saved photo was removed.
      avatar: fileSchema(
        "Upload an image",
        SUPPORTED_IMAGE_EXTENSIONS,
        "Upload a JPG, PNG or WEBP"
      )
        .nullable()
        .optional(),
      fullName: z.string().min(2, "Enter the driver's full name"),
      phone: z.string().min(9, "Enter a valid phone number"),
      email: z
        .string()
        .trim()
        .pipe(z.email("Enter a valid email address")),
      nationalId: z.string().min(5, "Enter the national ID number"),
      dateOfBirth: z
        .string()
        .min(1, "Enter the date of birth")
        .refine(
          (v) => !Number.isNaN(new Date(v).getTime()),
          "Enter a valid date"
        )
        .refine((v) => {
          const age = ageOn(v)
          return age >= policy.minAge && age <= policy.maxAge
        }, `Driver must be between ${policy.minAge} and ${policy.maxAge} years old at registration`),
      yardId: requireYard ? yardId : yardId.optional(),

      // Every vehicle type the driver can be assigned, each with its own
      // experience (DRIVER_VEHICLE_TYPES).
      vehicleTypes: z
        .array(
          z.object({
            vehicleType: z.enum(VEHICLE_TYPES, {
              message: "Select the vehicle type",
            }),
            yearsExperience: z
              .number({ message: "Enter years of experience" })
              .min(
                policy.minExperienceYears,
                `At least ${policy.minExperienceYears} years of experience on this vehicle type is required`
              )
              .max(50, "Enter a realistic number of years"),
          })
        )
        .min(1, "Add at least one vehicle type"),

      education: z.enum(EDUCATION_LEVELS, {
        message: "Select the education level",
      }),

      smoker: z.boolean(),
      drugUser: z.boolean(),

      licenseNumber: z.string().min(3, "Enter the licence number"),
      // One licence can cover several categories (DRIVER_LICENSE_CLASSES).
      licenseClasses: z
        .array(z.enum(VEHICLE_TYPES))
        .min(1, "Select at least one licence category"),
      licenseExpiry: z
        .string()
        .min(1, "Enter the licence expiry date")
        .refine((v) => new Date(v) > new Date(), "Licence has expired"),
      licenseCopy:
        mode === "edit" ? licenseCopyFile.optional() : licenseCopyFile,

      ...healthShape,

      drugAlcoholTest: z.enum(TEST_STATUSES),
      skillsTest: z.enum(TEST_STATUSES),
      practicalTest: z.enum(TEST_STATUSES),

      driverConfirmed: z
        .boolean()
        .refine((v) => v, "Confirm the driver has verified the information"),
      signedQuestionnaire: signedQuestionnaireFile.optional(),
    })
    // Object-level checks normally wait until every field is valid; `when`
    // lets each one run as soon as the fields it reads are valid, so the
    // errors show while the rest of the form is still being filled in.
    .superRefine(
      (data, ctx) => {
        // Each vehicle type only once.
        const seen = new Set<string>()
        data.vehicleTypes.forEach((v, i) => {
          if (seen.has(v.vehicleType)) {
            ctx.addIssue({
              code: "custom",
              path: ["vehicleTypes", i, "vehicleType"],
              message: "Each vehicle type can only be added once",
            })
          }
          seen.add(v.vehicleType)
        })

        // The licence must cover every vehicle type the driver can drive.
        const missing = uncoveredVehicleTypes(
          data.vehicleTypes.map((v) => v.vehicleType),
          data.licenseClasses
        )
        if (missing.length > 0) {
          ctx.addIssue({
            code: "custom",
            path: ["licenseClasses"],
            message: `Licence must cover every assigned vehicle type: ${missing
              .map((t) => labelFor("vehicleType", t))
              .join(", ")}`,
          })
        }
      },
      {
        when: ({ issues }) =>
          !issues.some((i) =>
            ["vehicleTypes", "licenseClasses"].includes(String(i.path?.[0]))
          ),
      }
    )
    .superRefine(
      (data, ctx) => {
        for (const q of HEALTH_QUESTIONS) {
          const answer = (data as Record<string, unknown>)[q.name]
          const details = (data as Record<string, unknown>)[
            `${q.name}Details`
          ] as string | undefined
          if (answer === "yes" && !details?.trim()) {
            ctx.addIssue({
              code: "custom",
              path: [`${q.name}Details`],
              message: "Please give details",
            })
          }
        }
      },
      // Only reads the answers and details, which are always strings.
      { when: () => true }
    )
}

/** The registration schema with the default policy. */
export const driverSchema = buildDriverSchema()

export type DriverFormValues = Omit<
  z.infer<typeof driverSchema>,
  "licenseCopy" | "yardId"
> & {
  /** Required when registering; optional when editing. */
  licenseCopy?: File
  /** Required whenever yards are set up. */
  yardId?: number
}
