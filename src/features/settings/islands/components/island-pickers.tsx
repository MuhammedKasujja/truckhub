import {
  islandDetailsQueryOptions,
  IslandSearchParams,
  islandListQueryOptions,
} from "../query-options"
import { Island } from "../types"
import { createEntityPicker } from "@/components/entity-picker"

export const { Picker: IslandSelector, PickerField: IslandSelectorField } =
  createEntityPicker<Island, IslandSearchParams>({
    mode: "remote",
    entityName: "island",
    listQueryOptions: islandListQueryOptions,
    detailQueryOptions: islandDetailsQueryOptions,
    defaultSearchParams: { search: "", perPage: 200 },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.name,
  })
