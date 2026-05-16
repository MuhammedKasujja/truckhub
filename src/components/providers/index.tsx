import { IntlProvider, Messages } from "use-intl"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/provider"
import { Theme } from "@/lib/theme"
import { DeepPartial } from "@/types"
import { HotkeysProvider } from "react-hotkeys-hook"

export function Providers({
  locale,
  theme,
  messages,
  children,
}: Readonly<{
  locale: string
  messages: DeepPartial<Messages>
  theme: Theme
  children: React.ReactNode
}>) {
  return (
    <HotkeysProvider initiallyActiveScopes={["main"]}>
      <ThemeProvider theme={theme}>
        <IntlProvider
          timeZone="Africa/Kampala"
          locale={locale}
          messages={messages}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </IntlProvider>
        <Toaster position={"top-right"} />
      </ThemeProvider>
    </HotkeysProvider>
  )
}
