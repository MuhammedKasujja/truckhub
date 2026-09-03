import { Client } from "../types";
import { createEntityPicker } from "@/components/entity-picker";
import { clientProfileQueryOptions, ClientSearchParams, clientListQueryOptions } from "../query-options";

export const { Picker: ClientPicker, PickerField: ClientPickerField } =
  createEntityPicker<Client, ClientSearchParams>({
    mode: "remote",
    entityName: "client",
    listQueryOptions: clientListQueryOptions,
    detailQueryOptions: clientProfileQueryOptions,
    defaultSearchParams: { search: "", perPage: 10 },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.name,
    createRoute: "/clients/new",
  })