import { Braces } from "lucide-react"
import { variableToken } from "../utils"
import type { TemplateVariable } from "../types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  variables: TemplateVariable[]
  /** Receives the token to insert, e.g. `{{ client.name }}` */
  onInsert: (token: string) => void
  disabled?: boolean
  label?: string
}

/** Lists the values the backend fills in when the email is sent. */
export function VariablePicker({
  variables,
  onInsert,
  disabled,
  label = "Insert variable",
}: Props) {
  if (variables.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Braces className="size-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Filled in when the email is sent</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {variables.map((variable) => (
          <DropdownMenuItem
            key={variable.path}
            onSelect={() => onInsert(variableToken(variable.path))}
            className="flex flex-col items-start gap-0.5"
          >
            <span className="text-sm">{variable.description}</span>
            <span className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
              <code className="font-mono">{variableToken(variable.path)}</code>
              {variable.sample !== null && (
                <span className="truncate">e.g. {String(variable.sample)}</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
