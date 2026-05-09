import { getAccessToken } from "@/lib/session";
import { jsonFormatter, logger } from "@/lib/logger";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: `${process.env.BACKEND_URL}`,
  timeout: 15000, // ← prevents hanging forever after 15 secs
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (process.env.NODE_ENV === "development") {
      logger.info(`Request data **************`);
      if (config.data) logger.debug(jsonFormatter(config.data));
    }
    // Skip adding token to login / refresh endpoints
    // const noAuthEndpoints = ["/login", "/refresh-token"];

    if (config.url?.includes("login")) {
      return config;
    }
    const accessToken = await getAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    // logger.error(error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      logger.info(`Api ************** ${response.config.url}`);
      logger.debug(jsonFormatter(response.data));
    }
    return response;
  },
  async (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      logger.info(
        `Endpoint  ${error.config?.url} [ ${error.request.method} ] ${error.code} --> ${error.status}\n`,
      );
      // logger.error(error)
      logger.error(
        jsonFormatter({
          ErrorCode: error.code,
          Response: error.response?.data,
          Status: error.response?.status,
        }),
      );
    }
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        ...error,
        response: {
          data: {
            status: 503,
            success: false,
            error: {
              code: "CONNECTION_TIMEOUT",
              message: "Connection timedout. Please try again",
            },
          },
        },
      });
    }
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNRESET" ||
      error.message.includes("Network Error")
    ) {
      return Promise.reject({
        ...error,
        response: {
          data: {
            status: 503,
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: "Could not connect to server",
            },
          },
        },
      });
    }
    // This handles when the API endpoint is Not Found
    if (error.status === 404 && !(error.response?.data as any).error) {
      if (process.env.NODE_ENV === "development") {
        logger.error(
          `${error.request.method} ${error.request.path} 404 - NOT FOUND`,
        );
      }
      return Promise.reject({
        ...error,
        response: {
          data: {
            status: 404,
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Api Endpoint not available",
            },
          },
        },
      });
    }

    if (error.response?.status === 401) {
      // TODO: refresh auth token
      // TODO: clear user session from cookies as this is not allowed to call server actions
      logger.debug("Logging out user.....");
      // const base = typeof window !== 'undefined'
      //   ? window.location.origin
      //   : '';  // fallback – won't be used on server anyway
      // try {
      //   await fetch(`${base}/api/logout`, {
      //     method: "POST",
      //     credentials: "include", // important for cookies
      //   });

      //   window.location.href = "/login?session=expired";
      // } catch (error) {
      //   logger.info("LOGOUT FAILED", error);
      // }
    }
    return Promise.reject(error);
  },
);

export { api };
