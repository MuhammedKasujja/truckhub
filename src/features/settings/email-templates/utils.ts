import { CUSTOM_KEY_PREFIX } from "./schemas"
import type { EmailTemplate, EmailTemplateDesign } from "./types"

export function isCustomTemplate(key: string) {
  return key.startsWith(CUSTOM_KEY_PREFIX)
}

/** A template written as a whole HTML document is sent without the shared layout. */
export function isFullHtmlDocument(html: string) {
  return /^\s*(<!doctype|<html)/i.test(html)
}

export function isTiptapDesign(
  design: EmailTemplate["design"]
): design is EmailTemplateDesign {
  return design?.format === "tiptap" && typeof design.doc === "object"
}

/** What the editor should open with: its saved state, else the stored HTML. */
export function initialEditorContent(template: EmailTemplate) {
  return isTiptapDesign(template.design) ? template.design.doc : template.html
}

export function variableToken(path: string) {
  return `{{ ${path} }}`
}
