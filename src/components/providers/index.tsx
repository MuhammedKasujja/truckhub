import { NextIntlClientProvider } from "next-intl";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClientProvider } from "./query-client-provider";

export function Providers({
  locale,
  children,
}: Readonly<{
  locale: string;
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <NextIntlClientProvider locale={locale}>
          <TooltipProvider>
            <QueryClientProvider>{children}</QueryClientProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
        <Toaster position={"top-right"} />
      </NuqsAdapter>
    </ThemeProvider>
  );
}
