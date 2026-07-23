import { LineItemRequest } from "../schemas"
import { makeId } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"

export function generateEmptyLineItem(itemType: "truck" | "small") {
  const emptyLineItem: LineItemRequest = {
    tempId: makeId("__line_item__"),
    unit_price: 0,
    subtotal: 0,
    line_total: 0,
    services: [],
    vehicle_addons: [],
    item_type: itemType,
    quantity: 1,
    discount: 0,
    car_brand_id: "",
    car_model_id: "",
    with_loaders: false,
    with_driver: false,
    estimated_consumption_rate_km: 0,
    engine_mode: "wet",
    tonnage: 0,
  }
  return emptyLineItem
}
