import type { ComposeEmailResult } from "../types"
import type { ComposeEmailInput, ComposePreviewInput } from "../schemas"
import type { RenderedEmail } from "@/features/settings/email-templates/types"
import * as apiClient from "@/lib/api-client"

const endpoint = "v1/mailing/compose"

/** Sends HTML written in the composer; values from records are already filled in. */
export async function composeEmail(data: ComposeEmailInput) {
  return await apiClient.postFn<ComposeEmailResult>(endpoint, data)
}

/** The email as it will be sent: cleaned and inside the shared layout. */
export async function previewComposedEmail(data: ComposePreviewInput) {
  return await apiClient.postFn<RenderedEmail>(`${endpoint}/preview`, data)
}
