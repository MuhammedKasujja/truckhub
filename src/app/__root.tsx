import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"

import appCss from "../styles.css?url"
import { Providers } from "@/components/providers"
import { getThemeServerFn } from "@/lib/theme"
import { NotFound } from "@/components/not-found"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { getTranslationsData } from "@/i18n/request"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Truckhub",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  loader: async () => {
    return {
      i18n: await getTranslationsData(),
      theme: await getThemeServerFn(),
    }
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n } = Route.useLoaderData()
  return (
    <html lang={i18n.locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers locale={i18n.locale} messages={i18n.messages}>
          {children}
        </Providers>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
