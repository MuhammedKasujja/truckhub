import { QueryClient } from "@tanstack/react-query"
import {
  createRouter,
  // parseSearchWith,
  // stringifySearchWith,
} from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen"
import { ApiError } from "./types"
import { onNavigationResolved } from "./lib/navigation-listeners"
// import qs from "query-string"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        // gcTime: 5 * 60 * 1000, // 5 minutes { Cache expiry time } if not given, cache indefinetly
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient }, // expose QueryClient via router context
    defaultPreload: "intent",
    // parseSearch: parseSearchWith((value) =>
    //   qs.parse(value,)
    // ),
    // stringifySearch: stringifySearchWith((value) =>
    //   qs.stringify(value, { arrayFormat: "comma" })
    // ),
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  if (typeof window !== "undefined") {
    router.subscribe("onResolved", ({ toLocation }) =>
      onNavigationResolved(toLocation)
    )
  }

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError // 👈 globally register api error type for react query
  }
}
