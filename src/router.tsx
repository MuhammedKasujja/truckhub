import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import {
  createRouter,
  isRedirect,
  // parseSearchWith,
  // stringifySearchWith,
} from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen"
import { ApiError } from "./types"
import { onNavigationResolved } from "./lib/navigation-listeners"
import { logoutFn } from "./features/auth/services"
// import qs from "query-string"

/**
 * True for anything the API layer uses to say "not signed in": a thrown
 * redirect, a thrown `ApiError` with a 401, or a returned result whose
 * `error` carries NOT_AUTHENTICATED / 401.
 */
function isNotAuthenticated(value: unknown): boolean {
  if (isRedirect(value)) return true
  if (typeof value !== "object" || value === null) return false

  const { statusCode, error } = value as {
    statusCode?: unknown
    error?: {
      status?: unknown
      erroCode?: unknown
      statusCode?: unknown
    } | null
  }
  if (statusCode === 401) return true
  return (
    error?.status === "NOT_AUTHENTICATED" ||
    error?.erroCode === "NOT_AUTHENTICATED" ||
    error?.statusCode === 401
  )
}

export function getRouter() {
  // A burst of failing queries must trigger a single logout
  let loggingOut = false

  // Runs for both errors and results: the API wrappers return errors as data
  const handleUnauthenticated = async (value: unknown) => {
    // Server: the router already handles redirects thrown during SSR loaders
    if (typeof window === "undefined") return
    if (!isNotAuthenticated(value) || loggingOut) return

    const { pathname, href } = router.state.location
    if (pathname === "/login") return

    loggingOut = true
    try {
      queryClient.clear()
      // Clears the session cookie; it ends by throwing a redirect
      await logoutFn().catch(() => {})
      await router.navigate({ to: "/login", search: { redirect: href } })
    } finally {
      loggingOut = false
    }
  }

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: handleUnauthenticated,
      onSuccess: handleUnauthenticated,
    }),
    mutationCache: new MutationCache({
      onError: handleUnauthenticated,
      onSuccess: handleUnauthenticated,
    }),
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        // gcTime: 5 * 60 * 1000, // 5 minutes { Cache expiry time } if not given, cache indefinetly
        retry: (count, error) => !isNotAuthenticated(error) && count < 2,
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
