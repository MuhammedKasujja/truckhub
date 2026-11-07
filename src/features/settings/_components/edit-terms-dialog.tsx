import { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import z from "zod"
import {
  FileSignature,
  GripVertical,
  PencilIcon,
  Plus,
  ScrollText,
  Trash2,
} from "lucide-react"
import { updateInvoiceTermsFn, updateQoutationTermsFn } from "../service"
import { SectionEmpty, SettingsFormDialog } from "./settings-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatPlural } from "@/lib/format"

export type TermsKind = "invoice" | "quotation"

const termsFormSchema = z.object({
  terms: z.array(
    z.object({ value: z.string().trim().min(1, "Write the term or remove it") })
  ),
})

type TermsFormValues = z.infer<typeof termsFormSchema>

const copy: Record<TermsKind, { title: string; description: string }> = {
  invoice: {
    title: "Invoice terms",
    description: "Printed at the bottom of every invoice, in this order.",
  },
  quotation: {
    title: "Quotation terms",
    description: "Printed at the bottom of every quotation, in this order.",
  },
}

type EditTermsDialogProps = {
  kind: TermsKind
  terms: string[]
}

export function EditTermsDialog({ kind, terms }: EditTermsDialogProps) {
  const [open, setOpen] = useState(false)
  const queryInvalidator = useQueryInvalidator()
  const { title, description } = copy[kind]

  const form = useForm<TermsFormValues>({
    resolver: zodResolver(termsFormSchema),
    defaultValues: { terms: terms.map((value) => ({ value })) },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "terms",
  })

  function handleOpenChange(next: boolean) {
    // Start from the saved terms each time the dialog opens.
    if (next) form.reset({ terms: terms.map((value) => ({ value })) })
    setOpen(next)
  }

  function addTerm() {
    append({ value: "" }, { shouldFocus: true })
  }

  async function onSubmit({ terms: values }: TermsFormValues) {
    const { error } =
      kind === "invoice"
        ? await updateInvoiceTermsFn({ data: { invoiceTerms: values } })
        : await updateQoutationTermsFn({ data: { quotationTerms: values } })

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(`${title} updated`)
    queryInvalidator.settings.refresh()
    setOpen(false)
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <Button type="button" variant="outline" size="sm">
          <PencilIcon />
          Edit
        </Button>
      }
      icon={kind === "invoice" ? ScrollText : FileSignature}
      eyebrow="Document terms"
      title={title}
      description={description}
      isSubmitting={form.formState.isSubmitting}
      footerNote={formatPlural(fields.length, {
        singular: "term",
        plural: "terms",
      })}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {fields.length === 0 ? (
        <SectionEmpty
          icon={ScrollText}
          title="No terms yet"
          description="Add the payment and service conditions your clients should see."
          action={
            <Button type="button" size="sm" onClick={addTerm}>
              <Plus />
              Add the first term
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <Sortable
            value={fields}
            getItemValue={(item) => item.id}
            onMove={({ activeIndex, overIndex }) =>
              move(activeIndex, overIndex)
            }
          >
            <SortableContent className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <SortableItem
                  key={field.id}
                  value={field.id}
                  className="group flex items-start gap-2 rounded-lg border bg-background p-2 shadow-xs"
                >
                  <SortableItemHandle asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical />
                    </Button>
                  </SortableItemHandle>
                  <span className="mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <Controller
                    control={form.control}
                    name={`terms.${index}.value`}
                    render={({ field: input, fieldState }) => (
                      <div className="min-w-0 flex-1 space-y-1">
                        <Input
                          {...input}
                          aria-label={`Term ${index + 1}`}
                          aria-invalid={fieldState.invalid}
                          placeholder="e.g. Payment is due within 30 days"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              if (index === fields.length - 1) addTerm()
                            }
                          }}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label={`Remove term ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </SortableItem>
              ))}
            </SortableContent>
          </Sortable>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={addTerm}
          >
            <Plus />
            Add a term
          </Button>
          <p className="text-xs text-muted-foreground">
            Drag the handle to reorder. Press Enter in the last term to add
            another.
          </p>
        </div>
      )}
    </SettingsFormDialog>
  )
}
