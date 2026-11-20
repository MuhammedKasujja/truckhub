// Desktop app server entry, run by the bundled Bun sidecar (see src-tauri/src/lib.rs).
//
// 1. Starts the Nitro app on 127.0.0.1:$PORT, the same as before, so only this
//    computer can reach it.
// 2. Opens a LAN gate on 0.0.0.0:$CAPTURE_PORT so a phone on the same Wi-Fi can
//    send a photo. The gate forwards only the phone-capture page, its API and
//    static assets; every other path gets a 404, so the rest of the app is
//    never exposed to the network.
//
// prepare-sidecar.sh copies this file next to Nitro's index.mjs.

// Nitro swaps the global Response/Headers for its own wrappers, which
// Bun.serve rejects, so keep the native ones from before it loads
const { Response, Headers } = globalThis

await import("./index.mjs")

const appPort = Number(process.env.PORT)
const capturePort = Number(process.env.CAPTURE_PORT)

/** [method, path pattern] pairs the phone may use. */
const ALLOWED = [
  ["GET", /^\/capture\/[^/]+$/],
  ["GET", /^\/api\/capture\/[^/]+$/],
  ["POST", /^\/api\/capture\/[^/]+$/],
  ["GET", /^\/assets\/[^/]+$/],
  ["GET", /^\/(favicon\.ico|manifest\.json)$/],
]

function isAllowed(method, pathname) {
  const verb = method === "HEAD" ? "GET" : method
  return ALLOWED.some(([m, pattern]) => m === verb && pattern.test(pathname))
}

/** Request headers never passed from the network to the app. */
const DROP_REQUEST = ["cookie", "host", "accept-encoding", "connection", "x-forwarded-host"]
/** Response headers never passed back to the phone. */
const DROP_RESPONSE = ["set-cookie", "content-encoding", "content-length", "connection"]

if (appPort && capturePort) {
  const gate = Bun.serve({
    hostname: "0.0.0.0",
    port: capturePort,
    async fetch(request) {
      const url = new URL(request.url)
      if (!isAllowed(request.method, url.pathname)) {
        return new Response("Not found", { status: 404 })
      }

      const headers = new Headers(request.headers)
      DROP_REQUEST.forEach((name) => headers.delete(name))

      try {
        const upstream = await fetch(
          `http://127.0.0.1:${appPort}${url.pathname}${url.search}`,
          {
            method: request.method,
            headers,
            body: request.body,
            duplex: "half",
            redirect: "manual",
          }
        )
        const responseHeaders = new Headers(upstream.headers)
        DROP_RESPONSE.forEach((name) => responseHeaders.delete(name))
        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: responseHeaders,
        })
      } catch {
        return new Response("TruckHub is starting. Try again in a moment.", {
          status: 502,
        })
      }
    },
  })
  console.log(`phone capture gate listening on 0.0.0.0:${capturePort}`)

  // Nitro shuts itself down on these; close the gate too so the process exits
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => gate.stop(true))
  }
}
