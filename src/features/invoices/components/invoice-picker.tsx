import { Invoice } from "../types"
import {
  invoiceDetailsQueryOptions,
  invoiceListSearchQueryOptions,
} from "../query-options"
import { createEntityPicker } from "@/components/entity-picker"
import { InvoiceListSearchParams } from "../schemas"

export const { Picker: InvoicePicker, PickerField: InvoicePickerField } =
  createEntityPicker<Invoice, InvoiceListSearchParams>({
    mode: "remote",
    entityName: "invoice",
    listQueryOptions: invoiceListSearchQueryOptions,
    detailQueryOptions: invoiceDetailsQueryOptions,
    defaultSearchParams: { search: "", perPage: 20, page: 1, sort: [] },
    getOptionValue: (v) => v.id,
    renderOption: (v) => v.number,
    label: "Invoice",
  })
