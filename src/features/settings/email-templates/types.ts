import type { JSONContent } from "@tiptap/react"

/** A value the backend fills in when the email is sent, e.g. `client.name`. */
export type TemplateVariable = {
  /** Dotted path, written in a template as `{{ client.name }}` */
  path: string
  description: string
  sample: string | number | boolean | null
}

/** A system template (invoice, quotation): its variables and built-in default. */
export type EmailTemplateCatalogEntry = {
  key: string
  name: string
  description: string
  variables: TemplateVariable[]
  default_subject: string
  default_html: string
}

/** Editor state saved next to the HTML, so the editor can reopen it exactly. */
export type EmailTemplateDesign = {
  format: "tiptap"
  doc: JSONContent
}

export type EmailTemplate = {
  /** "invoice.sent", "quotation.sent" or "custom.<name>" */
  key: string
  name: string
  subject: string
  /** The email body. The backend puts it inside the shared email layout. */
  html: string
  design: EmailTemplateDesign | null
  is_active: boolean
  /** False while the built-in default is in use */
  customized: boolean
  updated_at: string | null
}

export type RenderedEmail = {
  subject: string
  html: string
}
