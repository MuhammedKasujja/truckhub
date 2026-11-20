import { describe, expect, it } from "vitest"
import {
  ClientCreateSchema,
  ClientUpdateSchema,
  ClientContactsSchema,
} from "../../src/features/clients/schemas"features/clients/schemas"rc/features/clients/schemas"features/clients/schemas"
import type { ClientContactInput } from "../../src/features/clients/schemas"

const contact = (overrides: Partial<ClientContactInput> = {}) => ({
  name: "Jane",
  phone: "+256700000000",
  email: "jane@mail.com",
  is_primary: false,
  ...overrides,
})

const client = {
  name: "Acme Ltd",
  phone: "+256700000001",
  email: "info@acme.com",
  tin_number: "1000000000",
}

describe("ClientContactsSchema", () => {
  it("rejects an empty list", () => {
    expect(ClientContactsSchema.safeParse([]).success).toBe(false)
  })

  it("rejects a list with no primary", () => {
    expect(ClientContactsSchema.safeParse([contact()]).success).toBe(false)
  })

  it("rejects two primaries", () => {
    const contacts = [
      contact({ is_primary: true }),
      contact({ is_primary: true }),
    ]
    expect(ClientContactsSchema.safeParse(contacts).success).toBe(false)
  })

  it("accepts exactly one primary", () => {
    const contacts = [contact({ is_primary: true }), contact()]
    expect(ClientContactsSchema.safeParse(contacts).success).toBe(true)
  })

  it.each(["", null, undefined])("accepts a blank email: %s", (email) => {
    const contacts = [contact({ is_primary: true, email })]
    expect(ClientContactsSchema.safeParse(contacts).success).toBe(true)
  })

  it("rejects a malformed email", () => {
    const contacts = [contact({ is_primary: true, email: "nope" })]
    expect(ClientContactsSchema.safeParse(contacts).success).toBe(false)
  })

  it("keeps the server contact id", () => {
    const contacts = [contact({ is_primary: true, id: "contact-1" })]
    expect(ClientContactsSchema.parse(contacts)[0].id).toBe("contact-1")
  })
})

describe("client schemas", () => {
  it("requires contacts on create", () => {
    expect(ClientCreateSchema.safeParse(client).success).toBe(false)
  })

  it("requires contacts on update", () => {
    expect(ClientUpdateSchema.safeParse({ id: "client-1" }).success).toBe(false)
  })

  it("enforces one primary on update", () => {
    const input = { id: "client-1", contacts: [contact()] }
    expect(ClientUpdateSchema.safeParse(input).success).toBe(false)
  })

  it("accepts a partial update with valid contacts", () => {
    const input = { id: "client-1", contacts: [contact({ is_primary: true })] }
    expect(ClientUpdateSchema.safeParse(input).success).toBe(true)
  })
})
