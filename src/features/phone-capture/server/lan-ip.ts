import { networkInterfaces } from "node:os"

type Interfaces = ReturnType<typeof networkInterfaces>

/** Virtual adapters (Docker, VMs, VPN tunnels) a phone on Wi-Fi can't reach. */
const VIRTUAL = /^(docker|veth|br-|bridge|vboxnet|vmnet|utun|tun|tap|awdl|llw|zt|tailscale|virbr)/i
/** Physical Wi-Fi or Ethernet adapters, tried first. */
const PHYSICAL = /^(en|eth|wlan|wl|wi-?fi|ethernet)/i

function isPrivate(ip: string) {
  const [a, b] = ip.split(".").map(Number)
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
}

/**
 * The computer's address on the local network, for a phone on the same Wi-Fi
 * to reach. Undefined when the computer isn't on a private network.
 */
export function lanIp(interfaces: Interfaces = networkInterfaces()) {
  const candidates = Object.entries(interfaces)
    .filter(([name]) => !VIRTUAL.test(name))
    .flatMap(([name, addresses]) =>
      (addresses ?? [])
        .filter((a) => a.family === "IPv4" && !a.internal && isPrivate(a.address))
        .map((a) => ({ name, address: a.address }))
    )
  const physical = candidates.find((c) => PHYSICAL.test(c.name))
  return (physical ?? candidates[0])?.address
}
