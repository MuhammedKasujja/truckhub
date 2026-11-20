/** Shared accent palette for shipment screens and dialogs. */
export type Hue = "blue" | "emerald" | "amber" | "red" | "violet" | "slate"

export const HUE: Record<
  Hue,
  { tile: string; glow: string; text: string; soft: string }
> = {
  blue: {
    tile: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    glow: "from-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    soft: "border-blue-500/25 bg-blue-500/5",
  },
  emerald: {
    tile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "border-emerald-500/25 bg-emerald-500/5",
  },
  amber: {
    tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "from-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    soft: "border-amber-500/25 bg-amber-500/5",
  },
  red: {
    tile: "bg-destructive/10 text-destructive",
    glow: "from-destructive/15",
    text: "text-destructive",
    soft: "border-destructive/25 bg-destructive/5",
  },
  violet: {
    tile: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "from-violet-500/15",
    text: "text-violet-600 dark:text-violet-400",
    soft: "border-violet-500/25 bg-violet-500/5",
  },
  slate: {
    tile: "bg-muted text-muted-foreground",
    glow: "from-muted-foreground/10",
    text: "text-muted-foreground",
    soft: "border-border bg-muted/40",
  },
}
