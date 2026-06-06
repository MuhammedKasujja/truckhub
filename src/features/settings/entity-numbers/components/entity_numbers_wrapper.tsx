import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import {
  NumberingPatternType,
  NumberingPatternSchema,
  NumberingEntityKey,
} from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateEntityNumberPatternsFn } from "../services"
import { toast } from "sonner"
import { EntityPatternSettings } from "./entity_pattern_settings"
import { ENTITY_NUMBER_PATTERNS } from "@/common/constants"
import { SubmitButton } from "@/components/ui/submit-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type EntityNumbersWrapperProps = {
  patterns: NumberingPatternType
}

export function EntityNumbersWrapper({ patterns }: EntityNumbersWrapperProps) {
  const form = useForm<NumberingPatternType>({
    resolver: zodResolver(NumberingPatternSchema),
    defaultValues: { entities: patterns.entities },
  })

  const entities = form.watch("entities")

  const {
    formState: { dirtyFields },
  } = form

  function isEntityDirty(key: NumberingEntityKey): boolean {
    return !!dirtyFields?.entities?.[key]
  }

  const tabKeys = ENTITY_NUMBER_PATTERNS.filter(
    // make sure only allowed entities are displayed
    (key): key is NumberingEntityKey => key in entities
  )

  async function onSubmit(data: NumberingPatternType) {
    const { message, error } = await updateEntityNumberPatternsFn({ data })
    if (message) {
      toast.success(message)
    }
    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Tabs defaultValue={tabKeys[0]}>
        <TabsList>
          {tabKeys.map((entity) => (
            <TabsTrigger key={entity} value={entity}>
              {entity}
              {isEntityDirty(entity) && <DirtyDot />}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabKeys.map((entity) => (
          <TabsContent key={entity} value={entity}>
            <EntityPatternSettings control={form.control} entityKey={entity} />
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex justify-end">
        <SubmitButton isSubmitting={form.formState.isSubmitting} />
      </div>
    </form>
  )
}

function DirtyDot() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Changed
      </TooltipContent>
    </Tooltip>
  )
}
