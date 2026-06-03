import { IntlProvider, Messages } from "use-intl"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/provider"
import { DeepPartial } from "@/types"
import { HotkeysProvider } from "@tanstack/react-hotkeys"

export function Providers({
  locale,
  messages,
  children,
}: Readonly<{
  locale: string
  messages: DeepPartial<Messages>
  children: React.ReactNode
}>) {
  return (
    <HotkeysProvider>
      <ThemeProvider defaultTheme={"system"}>
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
