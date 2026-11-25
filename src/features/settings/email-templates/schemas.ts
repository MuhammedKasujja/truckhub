import z from "zod"

const TemplateKeySchema = z.string().min(1).max(100)

export const CUSTOM_KEY_PREFIX = "custom."

export const EmailTemplateKeySchema = z.object({ key: TemplateKeySchema })

const EmailTemplateDesignSchema = z.object({
  format: z.literal("tiptap"),
  doc: z.record(z.string(), z.any()),
})

export const EmailTemplateUpsertSchema = z.object({
  key: TemplateKeySchema,
  name: z.string().trim().min(1, "Give the template a name").max(255),
  subject: z.string().trim().min(1, "The subject is required").max(255),
  html: z.string().min(1, "The email body is empty"),
  design: EmailTemplateDesignSchema.nullable().optional(),
  is_active: z.boolean(),
})

export type EmailTemplateUpsertInput = z.infer<typeof EmailTemplateUpsertSchema>

export const EmailTemplatePreviewSchema = z.object({
  key: TemplateKeySchema,
  subject: z.string().min(1).max(255),
  html: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
})

export type EmailTemplatePreviewInput = z.infer<typeof EmailTemplatePreviewSchema>

/** The part after `custom.`; matches the backend's `custom.<slug>` rule. */
export const NewCustomTemplateSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9][a-z0-9_-]{0,60}$/,
      "Use lowercase letters, numbers, - and _, starting with a letter or number"
    ),
  name: z.string().trim().min(1, "Give the template a name").max(255),
})

export const emailTemplatesSearchSchema = z.object({
  key: TemplateKeySchema.optional().catch(undefined),
})
