import { createEntityPicker } from "@/components/entity-picker"
import { Bank } from "../types"
import { getBanksFn } from "../services"
import { IslandSearchParams } from "../../islands/query-options"
import { EntityPickerProps } from "@/common/types"
import { FieldValues } from "react-hook-form"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { useQuery } from "@tanstack/react-query"
import { banksListQueryOptions } from "../query-options"

// export const { Picker: BankPicker, PickerField: BankPickerField } =
//   createEntityPicker<Bank, IslandSearchParams>({
//     mode: "local",
//     entityName: 'Bank',
//     defaultSearchParams: { search: "", perPage: 25 },
//     detailQueryOptions:
//     // staticOptions: async ()=>{
//     //     const data = await getBanksFn();
//     //     return data?.data ??[]
//     // },
//     staticOptions: ()=>getBanksFn(),
//     getOptionValue: (c) => c.id,
//     renderOption: (c) => c.name,
//   })

export function BankPicker({ value, id, onSelected }: EntityPickerProps<Bank>) {
  const { data: banks, isLoading } = useQuery(banksListQueryOptions())
  return (
    <AutoComplete<Bank>
      id={id}
      options={banks ?? []}
      loading={isLoading}
      value={value}
      onChange={(driver) => {
        onSelected?.(driver)
      }}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      label="Car Brand"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
    />
  )
}

export function BankPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, Bank>) {
  //  const [query, setQuery] = useState("")
  const { data: banks, isLoading } = useQuery(banksListQueryOptions())
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={banks ?? []}
      control={control}
      label={label}
      remote={remote}
      //   onSearch={(q) => setQuery(q)}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
