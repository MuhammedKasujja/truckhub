import { describe, expect, it } from "vitest"
import { toCsv } from "../../src/features/reports/export"
import { withReportPreview } from "../../src/features/reports/preview-data"
import type { InvoiceReport } from "../../src/features/reports/types"

describe("toCsv", () => {
  it("escapes commas, quotes and newlines and blanks nullish values", () => {
    const csv = toCsv(
      [
        { name: 'Acme, "Ltd"', amount: 1200, note: null },
        { name: "Line\nbreak", amount: 0, note: undefined },
      ],
      [
        { header: "Client", value: (r) => r.name },
        { header: "Amount", value: (r) => r.amount },
        { header: "Note", value: (r) => r.note },
      ]
    )
    expect(csv).toBe(
      'Client,Amount,Note\r\n"Acme, ""Ltd""",1200,\r\n"Line\nbreak",0,'
    )
  })
})

describe("withReportPreview", () => {
  const period = { from: "2026-10-09", to: "2026-11-07" }

  it("fills a missing response with a complete sample", () => {
    const data = withReportPreview("shipments", undefined, period)
    expect(data.summary.shipments.value).toBeGreaterThan(0)
    expect(data.trend).toHaveLength(30)
    expect(data.by_lane.length).toBeGreaterThan(0)
  })

  it("keeps real API fields and is deterministic for a period", () => {
    const realClients: InvoiceReport["by_client"] = []
    const a = withReportPreview("invoices", { by_client: realClients }, period)
    const b = withReportPreview("invoices", undefined, period)
    expect(a.by_client).toBe(realClients)
    expect(a.summary).toEqual(b.summary)
  })

  it("switches to weekly buckets for long ranges", () => {
    const data = withReportPreview(
      "payments",
      undefined,
      { from: "2026-01-01", to: "2026-06-30" }
    )
    expect(data.trend).toHaveLength(26)
  })
})
