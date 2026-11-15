import { useState } from "react"
import { toast } from "sonner"
import {
  createDocumentTypeFn,
  downloadDocumentFn,
  updateDocumentTypeFn,
  uploadDocumentFn,
  voidDocumentFn,
} from "../services"
import type {
  CreateDocumentTypeInput,
  DocumentOwner,
  UpdateDocumentTypeInput,
  VoidDocumentInput,
} from "../schemas"
import type { DocumentLink } from "../types"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { objectToFormData } from "@/lib/form-utils"

const useCreateDocumentTypeBase = createEntityActionHook(
  createDocumentTypeFn,
  (invalidator) => invalidator.documents.types.invalidate()
)

export function useCreateDocumentType() {
  const { isPending, execute } = useCreateDocumentTypeBase()
  const createDocumentType = (data: CreateDocumentTypeInput) =>
    execute({ data })
  return { isPending, createDocumentType }
}

const useUpdateDocumentTypeBase = createEntityActionHook(
  updateDocumentTypeFn,
  // A type's rules show on every owner's documents too
  (invalidator) => invalidator.documents.all.invalidate()
)

export function useUpdateDocumentType() {
  const { isPending, execute } = useUpdateDocumentTypeBase()
  const updateDocumentType = (data: UpdateDocumentTypeInput) =>
    execute({ data })
  return { isPending, updateDocumentType }
}

type UploadInput = DocumentOwner & {
  documentTypeCode: string
  expiresOn?: string
  file: File
}

const useUploadDocumentBase = createEntityActionHook(
  // Files travel as multipart form data
  (input: UploadInput) => uploadDocumentFn({ data: objectToFormData(input) }),
  (invalidator) => invalidator.documents.all.invalidate()
)

export function useUploadDocument() {
  const { isPending, execute } = useUploadDocumentBase()
  return { isPending, uploadDocument: execute }
}

const useVoidDocumentBase = createEntityActionHook(
  voidDocumentFn,
  (invalidator) => invalidator.documents.all.invalidate()
)

export function useVoidDocument() {
  const { isPending, execute } = useVoidDocumentBase()
  const voidDocument = (data: VoidDocumentInput) => execute({ data })
  return { isPending, voidDocument }
}

/**
 * Opens a document in a new tab or saves it. The file comes through the app's
 * server, so the browser never holds an API token.
 */
export function useDocumentFile(owner: DocumentOwner) {
  const [busyId, setBusyId] = useState<string>()

  async function fetchFile(link: DocumentLink) {
    const response = await downloadDocumentFn({
      data: { ...owner, linkId: link.id },
    })
    // The link's own type, so the browser does not have to guess
    return new Blob([await response.blob()], { type: link.content_type })
  }

  async function run(link: DocumentLink, use: (url: string) => void) {
    setBusyId(link.id)
    try {
      const url = URL.createObjectURL(await fetchFile(link))
      use(url)
      // Long enough for the new tab or the download to pick the file up
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Could not open the document"
      )
    } finally {
      setBusyId(undefined)
    }
  }

  const open = (link: DocumentLink) =>
    run(link, (url) => {
      window.open(url, "_blank", "noopener,noreferrer")
    })

  const download = (link: DocumentLink) =>
    run(link, (url) => {
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = link.original_filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
    })

  return { open, download, busyId }
}
