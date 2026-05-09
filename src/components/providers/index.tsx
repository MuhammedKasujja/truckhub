import { IntlProvider } from "use-intl"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/provider"
import { Theme } from "@/lib/theme"
// import { NuqsAdapter } from "nuqs/adapters/next/app";
// import { QueryClientProvider } from "./query-client-provider";

export function Providers({
  locale,
  theme,
  children,
}: Readonly<{
  locale: string
  theme: Theme
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider
      theme={theme}
      // attribute="class"
      // defaultTheme="system"
      // enableSystem
      // disableTransitionOnChange
    >
      {/* <NuqsAdapter> */}
      <IntlProvider locale={locale} messages={{}}>
        <TooltipProvider>
          {/* <QueryClientProvider> */}
          {children}
          {/* </QueryClientProvider> */}
        </TooltipProvider>
      </IntlProvider>
      <Toaster position={"top-right"} />
      {/* </NuqsAdapter> */}
    </ThemeProvider>
  )
}
