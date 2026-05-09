export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export type ErrorStatusCode = "NOT_AUTHORIZED" | "NOT_AUTHENTICATED";

export type ErrorResponse = {
  success: false;
  error: {
    message: string;
    code: string | undefined;
  };
};

export type AppErrorDetails = {
  message: string;
  code: string | undefined;
  status?: ErrorStatusCode;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string | null;
};

// export type ApiResponse<T = unknown> = SuccessResponse<T> & ErrorResponse;
export type Pagination = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  data?: T;
  message?: string | null;
  error?: Prettify<AppErrorDetails>;
};

export type ApiPaginatedResponse<T = unknown> = ApiResponse<T> & {
  pagination?: Pagination;
};

export type EntityId = string | number;

export type SearchQuery = { search?: string };

export type ActionResult<T> = {
  data: T | null;
  error: string | unknown | null;
};
