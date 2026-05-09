import pino from "pino";
import { color, colorize } from "json-colorizer";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: !isProd
    ? {
        target: "pino-pretty", // package for formatting logs
        options: {
          colorize: true,
          colorizeObjects: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false, // keep objects multi-line
          levelFirst: true, // [ERROR] instead of level number
          messageFormat: true,
          // Optional but nice for errors
          // errorProps: '*,err,ErrorCode,Response,Status',
        },
      }
    : undefined, // production → plain JSON
  // Optional: redact sensitive fields
  redact: [
    "req.headers.cookie",
    "req.headers.authorization",
    "password",
    "token",
    "refreshToken",
  ],
});

export const jsonFormatter = (json: string | object) =>
  colorize(json, {
    colors: {
      StringLiteral: color.green,
      BooleanLiteral: color.yellow,
      StringKey: color.white,
      NullLiteral: color.gray,
      NumberLiteral: color.yellow,
      Comma: color.gray,
      Brace: color.gray,
      Colon: color.gray,
      Bracket: color.gray,
      Whitespace: color.gray,
    },
  });
