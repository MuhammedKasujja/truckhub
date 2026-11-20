import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  const isRealError = error instanceof Error
  if (isRealError) {
    console.error(error)
  } else {
    // Non-Error throwables (e.g. from beforeLoad) otherwise log as `{ routerCode }` only
    console.error("Non-Error thrown:", safeStringify(error), error)
  }

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent
        error={isRealError ? error : new Error("Something went wrong")}
      />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => {
            router.invalidate()
          }}
          className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`}
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/"
            className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`}
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className={`px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`}
            onClick={(e) => {
              e.preventDefault()
              router.history.back()
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  )
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, Object.getOwnPropertyNames(value ?? {}))
  } catch {
    return String(value)
  }
}
