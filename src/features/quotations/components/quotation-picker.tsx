import { createEntityPicker } from "@/components/entity-picker"
import { Quotation } from "../types"
import { QuotationListSearchParams } from "../schemas"
import {
  quotationDetailsQueryOptions,
  quotationQueryOptions,
} from "../query-options"

export const { Picker: QuotationPicker, PickerField: QuotationPickerField } =
  createEntityPicker<Quotation, QuotationListSearchParams>({
    entityName: "quotation",
    listQueryOptions: quotationQueryOptions,
    detailQueryOptions: quotationDetailsQueryOptions,
    defaultSearchParams: { search: "", perPage: 10 },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.number,
  })
