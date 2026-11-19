import { customAlphabet } from "nanoid";

const prefixes: Record<string, unknown> = {};

interface GenerateIdOptions {
  length?: number;
  separator?: string;
}

export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {},
) {
  const finalOptions =
    typeof prefixOrOptions === "object" ? prefixOrOptions : inputOptions;

  const prefix =
    typeof prefixOrOptions === "object" ? undefined : prefixOrOptions;

  const { length = 12, separator = "_" } = finalOptions;
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length,
  )();

  return prefix && prefix in prefixes
    ? `${prefixes[prefix]}${separator}${id}`
    : id;
}

/**
 * RFC 4122 v4 UUID. `crypto.randomUUID` only exists in secure contexts
 * (HTTPS / localhost), so fall back to `getRandomValues` — which is always
 * available — when the app is served over plain HTTP on a LAN address.
 */
export function uuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
