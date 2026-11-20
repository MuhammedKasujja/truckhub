import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import {
  CaptureError,
  acceptUpload,
  readCaptureInfo,
} from "@/features/phone-capture/server/capture-api"

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

const isId = (id: string) => z.uuid().safeParse(id).success

/** Public endpoints for the phone page. No sign-in; the link's token is checked instead. */
export const Route = createFileRoute("/api/capture/$id")({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        const token = new URL(request.url).searchParams.get("t") ?? ""
        const info = isId(params.id) ? readCaptureInfo(params.id, token) : null
        return info ? json(info) : json({ message: "This link has expired" }, 404)
      },
      POST: async ({ request, params }) => {
        if (!isId(params.id)) return json({ message: "Not found" }, 404)
        try {
          await acceptUpload(params.id, await request.formData())
          return json({ ok: true })
        } catch (error) {
          if (error instanceof CaptureError) {
            return json({ message: error.message }, error.status)
          }
          return json({ message: "Could not send the file. Try again." }, 500)
        }
      },
    },
  },
})
