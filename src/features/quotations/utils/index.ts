import { Quotation } from "../types"
import { makeId } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"
import { DistanceLineItemRequest, SmallLineItemRequest, TruckLineItemRequest } from "../schemas"

export function generateEmptyLineItem() {
  const emptyLineItem: SmallLineItemRequest = {
    tempId: makeId("__car_line_item__"),
    is_round_trip: false,
    unit_price: null,
    subtotal: null,
    line_total: null,
    locations: [],
    vehicle_addons: [],
    item_type: "small",
    quantity: 1,
    discount: null,
    car_brand_id: "",
    source: "service",
    car_model_id: "",
    with_driver: false,
    estimated_consumption_rate_km: undefined,
    engine_mode: "wet",
  }
  return emptyLineItem
}

export function generateTruckEmptyLineItem() {
  const emptyLineItem: TruckLineItemRequest = {
    tempId: makeId("__route_line_item__"),
    is_round_trip: false,
    unit_price: null,
    subtotal: null,
    line_total: null,
    locations: [],
    item_type: "truck",
    source: "route",
    quantity: 1,
    discount: null,
    with_driver: false,
    estimated_consumption_rate_km: 0,
    engine_mode: "wet",
    with_loaders: false,
    tonnage: 0,
  }
  return emptyLineItem
}

export function generateDistanceEmptyLineItem() {
  const emptyLineItem: DistanceLineItemRequest = {
    tempId: makeId("__distance_line_item__"),
    is_round_trip: false,
    unit_price: null,
    subtotal: null,
    line_total: null,
    locations: [],
    item_type: "truck",
    source: "distance",
    quantity: 1,
    discount: null,
    with_driver: false,
    estimated_consumption_rate_km: 0,
    engine_mode: "wet",
    with_loaders: false,
    tonnage: 0,
    distance_km: 0
  }
  return emptyLineItem
}

export function getEditableQuotation(quotation: Quotation) {
  return {
    client_id: quotation.client.id,
    line_items: quotation.versions[0].line_items,
    tax_rates: quotation.versions[0].tax_rates,
    expiry_date: quotation.versions[0].valid_until,
    number: quotation.number,
    discount: quotation.versions[0].discount,
    purpose: quotation.versions[0].purpose,
  }
}
