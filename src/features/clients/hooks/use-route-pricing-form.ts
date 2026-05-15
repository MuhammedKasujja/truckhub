import z from "zod"
import { useCallback, useState } from "react"
import { RoutePricingSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"

export function useRoutePricingForm() {
  const [routePricingIndex, setRoutePricingIndex] = useState(0)
  const form = useForm<z.infer<typeof RoutePricingSchema>>({
    resolver: zodResolver(RoutePricingSchema),
  })

  const {
    fields: routePricings,
    remove: removeRoutePricingRow,
    prepend: addRoutePricingRow,
  } = useFieldArray({
    control: form.control,
    name: "routes_pricings",
  })

//   const {
//     fields: tonnageList,
//     remove: removeTonnageRow,
//     prepend: addTonnageRow,
//   } = useFieldArray({
//     control: form.control,
//     name: `routes_pricings.${routePricingIndex ?? 0}.tonnages`,
//   })

  const handleAddRoutePricingRow = useCallback(() => {
    console.log(
      "Route Pricings list",
      routePricings.length,
      "Index",
      routePricingIndex
    )
    addRoutePricingRow({
      route: "",
      distance_km: 0,
      delivery_min_hrs: 0,
      delivery_max_hrs: 0,
      tonnages: [],
    })
    if (routePricings.length === 0) {
      setRoutePricingIndex(0)
    } else {
      setRoutePricingIndex(routePricings.length)
    }
    console.log(
      "Route Pricings list After Adding",
      routePricings.length,
      "Index -- New",
      routePricingIndex
    )
  }, [routePricingIndex, routePricings])

  function handleTonnageRow() {
    // addTonnageRow({
    //   tonnage_min: 0,
    //   tonnage_max: 0,
    //   price: 0,
    // })
  }

  const handleSubmit = form.handleSubmit

  return {
    form,
    routePricings,
    removeRoutePricingRow,
    handleAddRoutePricingRow,
    // tonnageList,
    handleTonnageRow,
    // removeTonnageRow,
    routePricingIndex,
    handleSubmit,
  }
}
