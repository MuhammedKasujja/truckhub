import { useCallback, useEffect, useRef, useState } from "react"
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  cancelCaptureSessionFn,
  createCaptureSessionFn,
  getCaptureStatusFn,
  takeCaptureFileFn,
} from "../services"

type Session = { id: string; url: string; expiresAt: number }

export type PhoneCaptureState =
  | "idle"
  | "creating"
  | "waiting"
  | "receiving"
  | "expired"
  | "error"

function fileNameFrom(response: Response, type: string) {
  const header = response.headers.get("content-disposition") ?? ""
  const match = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (match) return decodeURIComponent(match[1])
  const ext = type.split("/")[1]?.replace("jpeg", "jpg") ?? "bin"
  return `capture-${Date.now()}.${ext}`
}

const captureStatusQuery = (id: string) =>
  queryOptions({
    queryKey: ["phone-capture", id],
    queryFn: () => getCaptureStatusFn({ data: { id } }),
    refetchInterval: 1500,
    refetchIntervalInBackground: true,
    gcTime: 0,
  })

/**
 * Opens a hand-off session, then waits for the phone to send a file. The
 * finished file is passed to `onFile` exactly like a file input would.
 */
export function usePhoneCapture({
  accept,
  onFile,
}: {
  accept?: string
  onFile: (file: File) => void
}) {
  const [session, setSession] = useState<Session>()
  const [state, setState] = useState<PhoneCaptureState>("idle")
  const onFileRef = useRef(onFile)
  onFileRef.current = onFile

  const { mutate: createSession } = useMutation({
    mutationFn: () => createCaptureSessionFn({ data: { accept } }),
    onMutate: () => setState("creating"),
    onSuccess: (created) => {
      setSession(created)
      setState("waiting")
    },
    onError: () => setState("error"),
  })

  const status = useQuery({
    ...captureStatusQuery(session?.id ?? ""),
    enabled: !!session && state === "waiting",
  })

  // Expire on the client too, so the code is never shown past its life
  useEffect(() => {
    if (!session || state !== "waiting") return
    const left = session.expiresAt - Date.now()
    const timer = setTimeout(() => setState("expired"), Math.max(0, left))
    return () => clearTimeout(timer)
  }, [session, state])

  useEffect(() => {
    const value = status.data?.status
    if (!session || state !== "waiting" || !value) return
    if (value === "expired") {
      setState("expired")
      return
    }
    if (value !== "ready") return

    setState("receiving")
    ;(async () => {
      try {
        const response = await takeCaptureFileFn({ data: { id: session.id } })
        const blob = await response.blob()
        const type = blob.type || response.headers.get("content-type") || ""
        const file = new File([blob], fileNameFrom(response, type), {
          type,
          lastModified: Date.now(),
        })
        setSession(undefined)
        setState("idle")
        onFileRef.current(file)
        toast.success("File received from your phone")
      } catch {
        setState("error")
        toast.error("Could not get the file from your phone")
      }
    })()
  }, [status.data, session, state])

  const start = useCallback(() => createSession(), [createSession])

  const cancel = useCallback(() => {
    if (session && state === "waiting") {
      cancelCaptureSessionFn({ data: { id: session.id } }).catch(() => {})
    }
    setSession(undefined)
    setState("idle")
  }, [session, state])

  return {
    state,
    url: session?.url,
    expiresAt: session?.expiresAt,
    start,
    cancel,
  }
}
