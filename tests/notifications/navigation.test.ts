import { describe, expect, it } from "vitest"
import { notificationLink } from "../../src/features/notifications/navigation"

const ID = "0199a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b"

const link = (resource_type: string | null, resource_id: string | null = ID) =>
  notificationLink({ resource_type, resource_id })

describe("notificationLink", () => {
  it("opens the invoice or quotation a notification is about", () => {
    expect(link("invoice")).toMatchObject({
      to: "/invoices/$invoiceId/view",
      params: { invoiceId: ID },
    })
    expect(link("quotation")).toMatchObject({
      to: "/quotations/$quotationId/view",
      params: { quotationId: ID },
    })
  })

  it("opens the list for records that have no page of their own", () => {
    expect(link("payment")).toMatchObject({ to: "/payments" })
    expect(link("trip")).toMatchObject({ to: "/shipments/active" })
    expect(link("booking")).toMatchObject({ to: "/shipments/requests" })
  })

  it("falls back to the list when the id is missing", () => {
    expect(link("invoice", null)).toMatchObject({ to: "/invoices" })
    expect(link("quotation", null)).toMatchObject({ to: "/quotations" })
  })

  it("leads nowhere for a manual notification or an unknown resource", () => {
    expect(link(null)).toBeNull()
    expect(link("spaceship")).toBeNull()
  })
})
