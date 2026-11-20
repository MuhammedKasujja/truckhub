import { describe, expect, it } from "vitest"
import { isDeletableInvoice } from "../../src/features/invoices/enums"
import { describeInvoiceActivity } from "../../src/features/invoices/format"
import type { InvoiceActivity } from "../../src/features/invoices/types"

const activity = (
  type: InvoiceActivity["type"],
  details: InvoiceActivity["details"] = {}
): InvoiceActivity => ({
  id: "activity-1",
  type,
  occurred_at: "2026-11-15T12:00:00+00:00",
  actor_id: null,
  recipient_email: null,
  details,
})

describe("describeInvoiceActivity", () => {
  it("shows the amount and number of a payment", () => {
    const text = describeInvoiceActivity(
      activity("payment_recorded", {
        amount: "286000.00",
        payment_number: "PAY-0007",
      })
    )

    expect(text).toContain("286,000")
    expect(text).toContain("PAY-0007")
  })

  it("adds the reason to a reversed payment", () => {
    const text = describeInvoiceActivity(
      activity("payment_reversed", {
        amount: "1000.00",
        payment_number: "PAY-0007",
        reason: "bounced cheque",
      })
    )

    expect(text).toContain("bounced cheque")
  })

  it("shows why an invoice was voided", () => {
    expect(
      describeInvoiceActivity(activity("voided", { reason: "issued in error" }))
    ).toBe("issued in error")
  })

  it("has nothing to add to a plain event", () => {
    expect(describeInvoiceActivity(activity("created"))).toBeNull()
    expect(describeInvoiceActivity(activity("sent"))).toBeNull()
  })
})

describe("isDeletableInvoice", () => {
  it("allows only invoices the client does not owe", () => {
    expect(isDeletableInvoice("draft")).toBe(true)
    expect(isDeletableInvoice("void")).toBe(true)
    expect(isDeletableInvoice("cancelled")).toBe(true)
    expect(isDeletableInvoice("issued")).toBe(false)
    expect(isDeletableInvoice("partially_paid")).toBe(false)
    expect(isDeletableInvoice("paid")).toBe(false)
  })
})
