export const MailingModulePermissions = {
  // Writing and sending an email from the composer, previewing it included
  "mailing:compose": ["mailing:compose", "mailing:compose-preview"],
} as const

export type MailingPermissions = keyof typeof MailingModulePermissions
