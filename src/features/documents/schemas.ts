import z from "zod"
import { documentContentTypes, documentOwnerKinds } from "./enums"
import { IDSchema } from "@/schemas"

const MB = 1024 * 1024

export const documentOwnerSchema = z.object({
  ownerKind: z.enum(documentOwnerKinds),
  ownerId: IDSchema,
})

export type DocumentOwner = z.infer<typeof documentOwnerSchema>

/* ----------------------------- document types ----------------------------- */

export const listDocumentTypesSchema = z.object({
  ownerKind: z.enum(documentOwnerKinds),
  activeOnly: z.boolean().default(false),
})

const documentTypeRules = {
  name: z.string("Required").trim().min(2, "Too short").max(100),
  isRequired: z.boolean(),
  requiresExpiry: z.boolean(),
  isRestricted: z.boolean(),
  allowedContentTypes: z
    .array(z.enum(documentContentTypes))
    .min(1, "Allow at least one file type"),
  // Entered in MB, stored by the API in bytes
  maxSizeMb: z
    .number("Required")
    .positive("Must be above 0")
    .max(50, "At most 50 MB"),
  sortOrder: z.number().int().min(0),
}

export const createDocumentTypeSchema = z.object({
  ...documentTypeRules,
  code: z
    .string("Required")
    .trim()
    .min(2, "Too short")
    .max(50)
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Lowercase letters, digits and underscores, starting with a letter"
    ),
  ownerKind: z.enum(documentOwnerKinds),
})

export const updateDocumentTypeSchema = z.object({
  ...documentTypeRules,
  id: IDSchema,
  isActive: z.boolean(),
})

export type CreateDocumentTypeInput = z.infer<typeof createDocumentTypeSchema>
export type UpdateDocumentTypeInput = z.infer<typeof updateDocumentTypeSchema>

export const toMaxSizeBytes = (megabytes: number) => Math.round(megabytes * MB)
export const toMaxSizeMb = (bytes: number) =>
  Math.round((bytes / MB) * 100) / 100

/** "Medical certificate" -> "medical_certificate" */
export const toDocumentTypeCode = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+/, "")
    .replace(/_+$/, "")
    .slice(0, 50)

/* -------------------------------- documents ------------------------------- */

export const listDocumentsSchema = documentOwnerSchema.extend({
  currentOnly: z.boolean().default(false),
})

/** What the upload server function receives, as multipart form data. */
export const uploadDocumentSchema = documentOwnerSchema.extend({
  documentTypeCode: z.string().min(1),
  /** A calendar date, "2027-03-31". */
  expiresOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  file: z.instanceof(File, { message: "Choose a file" }),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>

export const documentLinkSchema = documentOwnerSchema.extend({
  linkId: IDSchema,
})

export const voidDocumentSchema = documentLinkSchema.extend({
  reason: z.string("Required").trim().min(3, "Too short").max(500),
})

export type VoidDocumentInput = z.infer<typeof voidDocumentSchema>

export const expiringDocumentsSchema = z.object({
  ownerKind: z.enum(documentOwnerKinds),
  withinDays: z.number().int().min(0).max(365).default(30),
})
