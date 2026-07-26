import { SmallLineItemRequest, TruckLineItemRequest } from "../schemas"
import { makeId } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"

export function generateEmptyLineItem() {
  const emptyLineItem: SmallLineItemRequest = {
    tempId: makeId("__car_line_item__"),
    is_round_trip: false,
    unit_price: null,
    subtotal: null,
    line_total: null,
    services: [],
    vehicle_addons: [],
    item_type: "small",
    quantity: 1,
    discount: null,
    car_brand_id: "",
    car_model_id: "",
    with_driver: false,
    estimated_consumption_rate_km: undefined,
    engine_mode: "wet",
  }
  return emptyLineItem
}

export function generateTruckEmptyLineItem() {
  const emptyLineItem: TruckLineItemRequest = {
    tempId: makeId("__truck_line_item__"),
    is_round_trip: false,
    unit_price: 0,
    subtotal: 0,
    line_total: 0,
    services: [],
    item_type: "truck",
    quantity: 1,
    discount: 0,
    with_driver: false,
    estimated_consumption_rate_km: 0,
    engine_mode: "wet",
    with_loaders: false,
    tonnage: 0,
  }
  return emptyLineItem
}
