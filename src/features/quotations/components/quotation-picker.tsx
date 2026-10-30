import { createEntityPicker } from "@/components/entity-picker"
import { Quotation } from "../types"
import {
  quotationDetailsQueryOptions,
  QuotationFilterParams,
  quotationFilterQueryOptions,
} from "../query-options"

export const { Picker: QuotationPicker, PickerField: QuotationPickerField } =
  createEntityPicker<Quotation, QuotationFilterParams>({
    mode: "remote",
    entityName: "quotation",
    listQueryOptions: quotationFilterQueryOptions,
    detailQueryOptions: quotationDetailsQueryOptions,
    defaultSearchParams: { search: "", perPage: 10 },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.number,
  })
