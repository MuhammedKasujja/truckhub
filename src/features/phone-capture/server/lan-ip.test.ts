import { describe, expect, it } from "vitest"
import { lanIp } from "./lan-ip"

const v4 = (address: string, internal = false) => ({
  address,
  netmask: "255.255.255.0",
  family: "IPv4" as const,
  mac: "00:00:00:00:00:00",
  internal,
  cidr: null,
})

describe("lanIp", () => {
  it("prefers the Wi-Fi adapter over virtual ones", () => {
    expect(
      lanIp({
        lo0: [v4("127.0.0.1", true)],
        bridge100: [v4("192.168.64.1")],
        utun3: [v4("10.8.0.2")],
        en0: [v4("192.168.1.20")],
      })
    ).toBe("192.168.1.20")
  })

  it("falls back to any private address", () => {
    expect(lanIp({ "Local Area Connection": [v4("10.0.0.5")] })).toBe("10.0.0.5")
  })

  it("ignores public and loopback addresses", () => {
    expect(lanIp({ lo: [v4("127.0.0.1", true)], en0: [v4("8.8.8.8")] })).toBeUndefined()
  })
})
