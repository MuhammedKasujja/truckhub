import { Client } from "../types";
import { ClientListSearchParams } from "../schemas";
import { createEntityPicker } from "@/components/entity-picker";
import { clientProfileQueryOptions, clientsSearchQueryOptions } from "../query-options";

export const { Picker: ClientPicker, PickerField: ClientPickerField } =
  createEntityPicker<Client, ClientListSearchParams>({
    entityName: "client",
    listQueryOptions: clientsSearchQueryOptions,
    detailQueryOptions: clientProfileQueryOptions,
    defaultSearchParams: { search: "" },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.name,
    createRoute: "/clients/new",
  })



// import { AutoComplete } from "@/components/ui/autocomplete-modified"
// import { Client } from "../types"
// import { EntityPickerProps } from "@/common/types"
// import {
//   FormAutoComplete,
//   FormAutoCompleteProps,
// } from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
// import { useState } from "react"
// import { useQuery } from "@tanstack/react-query"
// import { FieldValues } from "react-hook-form"
// import { clientsSearchQueryOptions } from "../query-options"

// export function ClientPicker({
//   value,
//   id,
//   onSelected,
// }: EntityPickerProps<Client>) {
//   const [query, setQuery] = useState("")
//   const { data, isLoading } = useQuery(clientsSearchQueryOptions())
//   return (
//     <AutoComplete<Client>
//       id={id}
//       options={data ?? []}
//       loading={isLoading}
//       value={value}
//       onChange={(client) => {
//         if (client)
//           onSelected?.({
//             ...client,
//             contacts: [
//               {
//                 name: "Kasujja Musa",
//                 id: "739403043",
//                 phone: "078493843",
//                 email: "musa@mail.com",
//                 is_primary: true,
//               },
//               {
//                 name: "Isaac Otim",
//                 id: "98738943",
//                 phone: "0794893400",
//                 email: "otim@mail.com",
//               },
//             ],
//           })
//         else onSelected?.(null)
//       }}
//       filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
//       label="Client"
//       getOptionValue={(u) => u.id}
//       renderOption={(u) => <span>{u.name}</span>}
//     />
//   )
// }

// export function ClientPickerField<TFieldValues extends FieldValues>({
//   name,
//   onSelected,
//   label,
//   description,
//   remote = false,
//   control,
//   ...props
// }: FormAutoCompleteProps<TFieldValues, Client>) {
//   const [query, setQuery] = useState("")
//   const { data, isLoading } = useQuery(clientsSearchQueryOptions(query))

//   // useEffect(()=>{
//   //    if(data && data.length >0 ){
//   //     const selectedClient = data.find((client) => client.id === props.value)
//   //    }
//   // }, [data])
//   return (
//     <FormAutoComplete
//       name={name}
//       loading={isLoading}
//       description={description}
//       options={data ?? []}
//       control={control}
//       label={label}
//       remote={remote}
//       onSearch={(q) => setQuery(q)}
//       filterFn={(client, q) =>
//         client.name.toLowerCase().includes(q.toLowerCase())
//       }
//       getOptionValue={(client) => client.id}
//       renderOption={(client) => <span>{client.name}</span>}
//       onSelected={onSelected}
//       {...props}
//     />
//   )
// }
