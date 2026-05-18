"use client";

import { useEffect, useRef } from "react";
import { Control, FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { Trash2, MapPin, User, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { TonnageRangeFields } from "./tonnage-range-fields";
import type { BatchPricingInput } from "../schemas";

interface RouteCardProps {
  routeIndex: number;
  control: Control<BatchPricingInput>;
  register: UseFormRegister<BatchPricingInput>;
  errors: FieldErrors<BatchPricingInput>;
  onRemove: () => void;
  canRemove: boolean;
  /** Controlled open state from parent */
  isOpen: boolean;
  onToggle: () => void;
  /** When true, focuses the route name input after opening */
  shouldFocus?: boolean;
  onFocusDone?: () => void;
}

export function RoutePricingCard({
  routeIndex,
  control,
  register,
  errors,
  onRemove,
  canRemove,
  isOpen,
  onToggle,
  shouldFocus,
  onFocusDone,
}: RouteCardProps) {
  const routeErrors = errors?.routes?.[routeIndex];
  const hasErrors = !!routeErrors;

  const name = useWatch({ control, name: `routes.${routeIndex}.name` });
  const origin = useWatch({ control, name: `routes.${routeIndex}.origin` });
  const destination = useWatch({ control, name: `routes.${routeIndex}.destination` });
  const ranges = useWatch({ control, name: `routes.${routeIndex}.ranges` });
  const rangeCount = ranges?.length ?? 0;

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Focus the route name input shortly after opening, giving the
  // Collapsible animation time to finish before we attempt focus.
  useEffect(() => {
    if (shouldFocus && isOpen) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
        onFocusDone?.();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [shouldFocus, isOpen, onFocusDone]);

  // Build a compact summary shown when collapsed
  const routeSummary = [origin, destination].filter(Boolean).join(" → ");

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card
        className={cn(
          "relative overflow-hidden shadow-none transition-colors",
          hasErrors ? "border-destructive/50" : "border-border/60"
        )}
      >
        {/* Left accent bar — red when there are errors */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-0.75 rounded-l-lg transition-colors",
            hasErrors ? "bg-destructive/50" : "bg-primary/20"
          )}
        />

        {/* ── Clickable header ── */}
        <CollapsibleTrigger asChild>
          <CardHeader
            className="pb-3 pt-4 px-5 cursor-pointer select-none hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono text-xs"
                >
                  {String(routeIndex + 1).padStart(2, "0")}
                </Badge>

                <div className="min-w-0">
                  <span className="text-sm font-medium truncate text-foreground">
                    {name || (
                      <span className="text-muted-foreground italic font-normal">
                        Unnamed route
                      </span>
                    )}
                  </span>
                  {/* Compact summary visible only when collapsed */}
                  {!isOpen && routeSummary && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {routeSummary}
                    </span>
                  )}
                </div>

                <span className="text-xs text-muted-foreground shrink-0">
                  {rangeCount} range{rangeCount !== 1 ? "s" : ""}
                </span>

                {/* Error indicator shown when collapsed with errors */}
                {!isOpen && hasErrors && (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      // Prevent the collapsible trigger from firing
                      e.stopPropagation();
                      onRemove();
                    }}
                    aria-label="Remove route"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* ── Collapsible body ── */}
        <CollapsibleContent>
          <CardContent className="px-5 pb-5 space-y-4">
            {/* Route identity */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`route-name-${routeIndex}`}
                  className="text-xs text-muted-foreground"
                >
                  Route name
                </Label>
                <Input
                  id={`route-name-${routeIndex}`}
                  placeholder="Kampala → Masaka"
                  aria-invalid={!!routeErrors?.name}
                  {...register(`routes.${routeIndex}.name`)}
                  ref={(el) => {
                    register(`routes.${routeIndex}.name`).ref(el);
                    nameInputRef.current = el;
                  }}
                  className={cn(routeErrors?.name && "border-destructive")}
                />
                {routeErrors?.name && (
                  <p className="text-xs text-destructive">
                    {routeErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`origin-${routeIndex}`}
                  className="text-xs text-muted-foreground"
                >
                  <MapPin className="inline h-3 w-3 mr-1 -mt-0.5" />
                  Origin
                </Label>
                <Input
                  id={`origin-${routeIndex}`}
                  placeholder="Kampala"
                  aria-invalid={!!routeErrors?.origin}
                  {...register(`routes.${routeIndex}.origin`)}
                  className={cn(routeErrors?.origin && "border-destructive")}
                />
                {routeErrors?.origin && (
                  <p className="text-xs text-destructive">
                    {routeErrors.origin.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`destination-${routeIndex}`}
                  className="text-xs text-muted-foreground"
                >
                  <MapPin className="inline h-3 w-3 mr-1 -mt-0.5" />
                  Destination
                </Label>
                <Input
                  id={`destination-${routeIndex}`}
                  placeholder="Masaka"
                  aria-invalid={!!routeErrors?.destination}
                  {...register(`routes.${routeIndex}.destination`)}
                  className={cn(routeErrors?.destination && "border-destructive")}
                />
                {routeErrors?.destination && (
                  <p className="text-xs text-destructive">
                    {routeErrors.destination.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Tonnage ranges */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Tonnage ranges & pricing
              </p>
              {routeErrors?.ranges?.root?.message && (
                <p className="text-xs text-destructive mb-2">
                  {routeErrors.ranges.root.message}
                </p>
              )}
              <TonnageRangeFields
                routeIndex={routeIndex}
                control={control}
                errors={errors}
              />
            </div>

            <Separator />

            {/* Optional client override */}
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 w-48">
                <Label
                  htmlFor={`client-${routeIndex}`}
                  className="text-xs text-muted-foreground"
                >
                  <User className="inline h-3 w-3 mr-1 -mt-0.5" />
                  Client ID
                  <span className="ml-1 text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  id={`client-${routeIndex}`}
                  type="number"
                  placeholder="Leave blank for default"
                  {...register(`routes.${routeIndex}.client_id`, {
                    setValueAs: (v) =>
                      v === "" || v === null ? null : parseInt(v),
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground pb-2 leading-relaxed">
                Set a client ID for negotiated pricing. Leave blank for the default rate.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}