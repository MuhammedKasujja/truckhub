import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileCog, Lock, Pencil } from "lucide-react"
import { contentTypesLabel, fileSizeLabel } from "../format"
import { documentTypesQueryOptions } from "../query-options"
import { DocumentTypeForm } from "./document-type-form"
import type { DocumentOwnerKind } from "../enums"
import type { DocumentType } from "../types"
import { Can } from "@/components/has-permission"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { cn } from "@/lib/utils"

/** The document types kept for one kind of record, inactive ones included. */
export function DocumentTypesTable({
  ownerKind,
}: {
  ownerKind: DocumentOwnerKind
}) {
  const [editing, setEditing] = useState<DocumentType>()
  const {
    data: types,
    isLoading,
    error,
  } = useQuery(documentTypesQueryOptions(ownerKind))

  if (isLoading) {
    return (
      <p className="p-5 text-sm text-muted-foreground">
        Loading document types…
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="p-5 text-sm text-destructive">
        {error.message || "Could not load the document types"}
      </p>
    )
  }

  if (!types?.length) {
    return (
      <SectionEmpty
        icon={FileCog}
        title="No document types yet"
        description="Add the kinds of document you keep on file, such as a medical certificate."
      />
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="pl-5">Document</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Files</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 pr-5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => (
            <TableRow
              key={type.id}
              className={cn(!type.is_active && "text-muted-foreground")}
            >
              <TableCell className="pl-5">
                <p className="font-medium">{type.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {type.code}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {type.is_required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                  {type.requires_expiry && (
                    <Badge variant="secondary">Expires</Badge>
                  )}
                  {type.is_restricted && (
                    <Badge variant="outline">
                      <Lock />
                      Restricted
                    </Badge>
                  )}
                  {!type.is_required &&
                    !type.requires_expiry &&
                    !type.is_restricted && (
                      <span className="text-xs text-muted-foreground">
                        Optional
                      </span>
                    )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {contentTypesLabel(type.allowed_content_types)}
                <span className="text-muted-foreground">
                  {" "}
                  · up to {fileSizeLabel(type.max_size_bytes)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={type.is_active ? "secondary" : "outline"}>
                  {type.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="pr-5 text-right">
                <Can permission="config:document_types:edit">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${type.name}`}
                    onClick={() => setEditing(type)}
                  >
                    <Pencil />
                  </Button>
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DocumentTypeForm
        ownerKind={ownerKind}
        documentType={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
      />
    </>
  )
}
