import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Ban,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Loader2,
  Lock,
  Upload,
} from "lucide-react"
import {
  buildDocumentRows,
  canPreview,
  fileSizeLabel,
  isVoided,
} from "../format"
import { useDocumentFile } from "../hooks/use-document-actions"
import {
  documentTypesQueryOptions,
  ownerDocumentsQueryOptions,
} from "../query-options"
import { ExpiryBadge } from "./expiry-badge"
import { UploadDocumentDialog } from "./upload-document-dialog"
import { VoidDocumentDialog } from "./void-document-dialog"
import type { DocumentRow } from "../format"
import type { DocumentOwner } from "../schemas"
import type { DocumentLink } from "../types"
import type { UserPermission } from "@/features/auth/permissions"
import { useAuth } from "@/components/providers/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = DocumentOwner & {
  /** What the signed-in user needs to see, add, open and withdraw documents. */
  permissions: {
    view: UserPermission
    upload: UserPermission
    download: UserPermission
    void: UserPermission
  }
}

/**
 * A record's documents: one row per document type with the file in force,
 * what is missing or expiring, and the earlier versions.
 */
export function DocumentsPanel({ ownerKind, ownerId, permissions }: Props) {
  const owner = useMemo(() => ({ ownerKind, ownerId }), [ownerKind, ownerId])
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const canView = hasPermission(permissions.view)
  const canUpload = hasPermission(permissions.upload)
  const canOpen = hasPermission(permissions.download)
  const canVoid = hasPermission(permissions.void)

  const [uploading, setUploading] = useState<DocumentRow>()
  const [voiding, setVoiding] = useState<DocumentLink>()

  const typesQuery = useQuery({
    ...documentTypesQueryOptions(ownerKind),
    enabled: canView,
  })
  const documentsQuery = useQuery({
    ...ownerDocumentsQueryOptions(owner),
    enabled: canView,
  })
  const file = useDocumentFile(owner)

  const rows = useMemo(
    () => buildDocumentRows(typesQuery.data ?? [], documentsQuery.data ?? []),
    [typesQuery.data, documentsQuery.data]
  )

  if (!canView) {
    return (
      <p className="text-sm text-muted-foreground">
        You do not have access to these documents.
      </p>
    )
  }

  const error = typesQuery.error ?? documentsQuery.error
  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error.message || "Could not load the documents"}
      </p>
    )
  }

  if (typesQuery.isLoading || documentsQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading documents…</p>
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No document types are set up yet. Add them under Settings → Document
        types.
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-2">
        {rows.map((row) => {
          // Restricted files are for administrators only
          const mayOpen =
            canOpen && (!row.type.is_restricted || !!user?.is_admin)
          return (
            <DocumentRowItem
              key={row.type.id}
              row={row}
              file={file}
              mayOpen={mayOpen}
              onUpload={
                canUpload && !row.isManagedElsewhere && row.type.is_active
                  ? () => setUploading(row)
                  : undefined
              }
              onVoid={
                canVoid && !row.isManagedElsewhere ? setVoiding : undefined
              }
            />
          )
        })}
      </ul>

      <UploadDocumentDialog
        owner={owner}
        documentType={uploading?.type}
        current={uploading?.current}
        onClose={() => setUploading(undefined)}
      />
      <VoidDocumentDialog
        owner={owner}
        link={voiding}
        onClose={() => setVoiding(undefined)}
      />
    </>
  )
}

type FileActions = ReturnType<typeof useDocumentFile>

function DocumentRowItem({
  row,
  file,
  mayOpen,
  onUpload,
  onVoid,
}: {
  row: DocumentRow
  file: FileActions
  mayOpen: boolean
  onUpload?: () => void
  onVoid?: (link: DocumentLink) => void
}) {
  const { type, current, history } = row
  const [showHistory, setShowHistory] = useState(false)

  return (
    <li className="rounded-lg border">
      <div className="flex items-start gap-3 p-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
            current && "bg-primary/10 text-primary"
          )}
        >
          <FileText className="size-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-medium">{type.name}</p>
            {row.isMissing && <Badge variant="destructive">Required</Badge>}
            {current && <ExpiryBadge expiresOn={current.expires_on} />}
            {type.is_restricted && (
              <Badge variant="outline">
                <Lock />
                Restricted
              </Badge>
            )}
            {!type.is_active && <Badge variant="outline">Inactive type</Badge>}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {current
              ? `${current.original_filename} · ${fileSizeLabel(current.size_bytes)} · ${formatDate(current.uploaded_at)}`
              : "Not uploaded yet"}
          </p>
          {row.isManagedElsewhere && (
            <p className="text-xs text-muted-foreground">
              Replaced when the licence is changed.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {current && mayOpen && (
            <FileButtons link={current} file={file} label={type.name} />
          )}
          {onUpload && (
            <Button variant="outline" size="sm" onClick={onUpload}>
              <Upload />
              {current ? "Replace" : "Upload"}
            </Button>
          )}
          {current && onVoid && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Void ${type.name}`}
              title="Void"
              onClick={() => onVoid(current)}
            >
              <Ban />
            </Button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="border-t">
          <button
            type="button"
            aria-expanded={showHistory}
            onClick={() => setShowHistory((shown) => !shown)}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/40"
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                showHistory && "rotate-180"
              )}
            />
            {history.length} earlier version{history.length === 1 ? "" : "s"}
          </button>
          {showHistory && (
            <ul className="divide-y border-t bg-muted/20">
              {history.map((link) => (
                <li key={link.id} className="flex items-start gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {link.original_filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fileSizeLabel(link.size_bytes)} · Uploaded{" "}
                      {formatDate(link.uploaded_at)}
                      {link.expires_on &&
                        ` · Expiry ${formatDate(link.expires_on)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isVoided(link)
                        ? `Voided ${formatDate(link.voided_at)}${
                            link.void_reason ? `: ${link.void_reason}` : ""
                          }`
                        : "Replaced by a newer version"}
                    </p>
                  </div>
                  {mayOpen && (
                    <FileButtons
                      link={link}
                      file={file}
                      label={link.original_filename}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

/** Open (for files a browser can show) and download. */
function FileButtons({
  link,
  file,
  label,
}: {
  link: DocumentLink
  file: FileActions
  label: string
}) {
  const isBusy = file.busyId === link.id

  if (isBusy) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        disabled
        aria-label="Fetching file"
      >
        <Loader2 className="animate-spin" />
      </Button>
    )
  }

  return (
    <>
      {canPreview(link.content_type) && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Open ${label}`}
          title="Open"
          disabled={!!file.busyId}
          onClick={() => file.open(link)}
        >
          <Eye />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Download ${label}`}
        title="Download"
        disabled={!!file.busyId}
        onClick={() => file.download(link)}
      >
        <Download />
      </Button>
    </>
  )
}
