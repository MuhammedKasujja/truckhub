"use client"

import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Upload, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { batchPricingSchema, type BatchPricingInput } from "../schemas"
import { RoutePricingCard } from "./route-pricing-card"
import { DatePickerField } from "@/components/ui/form-fields"

const EMPTY_RANGE = {
  min_tons: undefined as any,
  max_tons: undefined as any,
  price: undefined as any,
  client_id: null,
}

const EMPTY_ROUTE = {
  name: "",
  origin: "",
  destination: "",
  client_id: null,
  ranges: [EMPTY_RANGE],
}

interface BatchPricingFormProps {
  onSubmit?: (data: BatchPricingInput) => Promise<void>
}

export function BatchPricingForm({ onSubmit }: BatchPricingFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  // Track which route field IDs are expanded. Use field.id (stable string)
  // so indices shifting on remove don't break open/closed state.
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  // When true, the next fields update (after append) should open the new card.
  const [pendingOpen, setPendingOpen] = useState(false)

  // The field.id of the card whose name input should receive focus.
  const [focusId, setFocusId] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<BatchPricingInput>({
    resolver: zodResolver(batchPricingSchema),
    defaultValues: {
      valid_from: new Date(),
      routes: [EMPTY_ROUTE],
    },
    mode: "onBlur",
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "routes",
  })

  function toggleRoute(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function addRoute() {
    // Validate all existing routes before allowing a new one to be added.
    // trigger() runs Zod on the specified fields and populates errors.
    const valid = await trigger(
      fields.flatMap((_, i) => [
        `routes.${i}.name`,
        `routes.${i}.origin`,
        `routes.${i}.destination`,
        `routes.${i}.ranges`,
      ]) as any
    )

    if (!valid) {
      // Open every route that has errors so the user can see what to fix.
      setOpenIds((prev) => {
        const next = new Set(prev)
        fields.forEach((field, i) => {
          if (errors?.routes?.[i]) next.add(field.id)
        })
        return next
      })
      return
    }

    // All valid — collapse all existing routes, then append.
    // The useEffect below watches fields.length and opens the new card
    // once useFieldArray has committed the append and fields has updated.
    setOpenIds(new Set())
    setPendingOpen(true)
    append(EMPTY_ROUTE)
  }

  // After append, fields updates asynchronously. This effect fires once
  // fields.length increases while pendingOpen is true, then opens the new card.
  useEffect(() => {
    if (pendingOpen && fields.length > 0) {
      const newField = fields[fields.length - 1]
      setOpenIds(new Set([newField.id]))
      setFocusId(newField.id);
      setPendingOpen(false)
    }
  }, [fields.length, pendingOpen])

  useEffect(() => {
    setOpenIds(new Set(fields.map((f) => f.id)))
    if (fields.length > 0) setFocusId(fields[0].id) // focus first one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // For summary counts
  const watchedRoutes = watch("routes")
  const totalRanges =
    watchedRoutes?.reduce((sum, r) => sum + (r.ranges?.length ?? 0), 0) ?? 0

  async function onFormSubmit(data: BatchPricingInput) {
    setSubmitStatus("loading")
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        console.log("Batch payload:", JSON.stringify(data, null, 2))
        await new Promise((r) => setTimeout(r, 600))
      }
      setSubmitStatus("success")
      setSubmitMessage("Batch submitted successfully.")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (err: any) {
      setSubmitStatus("error")
      setSubmitMessage(err?.message ?? "Submission failed.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Routes pricing
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define tonnage ranges and prices for multiple routes.
          </p>
        </div>
        <div className="shrink-0 rounded-md bg-muted px-3 py-2 text-right text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{fields.length}</span>{" "}
          route{fields.length !== 1 ? "s" : ""} ·{" "}
          <span className="font-medium text-foreground">{totalRanges}</span>{" "}
          range{totalRanges !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Valid from date ── */}
      <div className="grid md:grid-cols-3">
        <DatePickerField
          label="Pricing valid from"
          control={control}
          name="valid_from"
        />
      </div>

      {/* ── Route cards ── */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <RoutePricingCard
            key={field.id}
            routeIndex={index}
            control={control}
            register={register}
            errors={errors}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            isOpen={openIds.has(field.id)}
            onToggle={() => toggleRoute(field.id)}
            shouldFocus={focusId === field.id}
            onFocusDone={() => setFocusId(null)}
          />
        ))}
      </div>

      {/* Routes-level error */}
      {errors.routes?.root?.message && (
        <p className="text-xs text-destructive">{errors.routes.root.message}</p>
      )}

      {/* ── Add route ── */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={addRoute}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add route
      </Button>

      {/* ── Feedback ── */}
      {submitStatus === "success" && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <AlertDescription>{submitMessage}</AlertDescription>
        </Alert>
      )}
      {submitStatus === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{submitMessage}</AlertDescription>
        </Alert>
      )}

      {/* ── Submit ── */}
      <div className="flex justify-end border-t pt-2">
        <Button
          type="submit"
          disabled={submitStatus === "loading"}
          className="min-w-36"
        >
          {submitStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit batch
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
