import { z } from "zod"

export const MAX_RECIPIENTS = 20

export const ComposeAttachmentSchema = z.object({
  type: z.enum(["invoice", "quotation"]),
  id: z.string().min(1),
})

export const ComposeEmailSchema = z
  .object({
    to: z.email("Enter a valid email address"),
    cc: z.array(z.email()).default([]),
    bcc: z.array(z.email()).default([]),
    reply_to: z.email().nullish(),
    subject: z.string().trim().min(1, "Add a subject").max(255),
    body_html: z.string().min(1, "Write the email"),
    attachments: z.array(ComposeAttachmentSchema).max(5).default([]),
  })
  .refine((v) => 1 + v.cc.length + v.bcc.length <= MAX_RECIPIENTS, {
    message: `At most ${MAX_RECIPIENTS} recipients in total`,
    path: ["cc"],
  })

export const ComposePreviewSchema = z.object({
  subject: z.string().min(1).max(255),
  body_html: z.string().min(1),
})

export type ComposeAttachment = z.infer<typeof ComposeAttachmentSchema>
export type ComposeEmailInput = z.input<typeof ComposeEmailSchema>
export type ComposePreviewInput = z.infer<typeof ComposePreviewSchema>
