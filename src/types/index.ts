export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type DeepPartial<Type> = {
  [Key in keyof Type]?: Type[Key] extends object
    ? DeepPartial<Type[Key]>
    : Type[Key]
}

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export type ErrorStatusCode = "NOT_AUTHORIZED" | "NOT_AUTHENTICATED"

export type ErrorResponse = {
  success: false
  error: {
    message: string
    code: string | undefined
  }
}

export type AppErrorDetails = {
  message: string
  code: string | undefined
  status?: ErrorStatusCode
}

export type SuccessResponse<T> = {
  success: true
  data: T
  message: string | null
}

// export type ApiResponse<T = unknown> = SuccessResponse<T> & ErrorResponse;
export type Pagination = {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type ApiResponse<T = unknown> = {
  isSuccess: boolean
  data?: T
  message?: string | null
  error?: Prettify<AppErrorDetails>
}

export type ApiPaginatedResponse<T = unknown> = ApiResponse<T> & {
  pagination?: Pagination
}

export type SearchQuery = { search?: string }

export type ActionResult<T> = {
  data: T | null
  error: string | undefined | null
}

export const ApiErrorCodes = {
  400: "BAD_REQUEST",
  401: "NOT_AUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  405: "METHOD_NOT_ALLOWED",
  406: "NOT_ACCEPTABLE",
  409: "CONFLICT",
  415: "UNSUPPORTED_MEDIA_TYPE",  
  422: "VALIDATION_FAILED",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
  503: "SERVICE_UNAVAILABLE",
} as const

type StatusCode = keyof typeof ApiErrorCodes

type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes]

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCode,
    public erroCode?: ApiErrorCode,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getError<T extends StatusCode>(
  code: T
): (typeof ApiErrorCodes)[T] {
  return ApiErrorCodes[code]
}
