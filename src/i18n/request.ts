import { getUserLocale } from "@/server/locale";
import { getRequestConfig } from "use-intl/server";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`./messages/${locale}/index.ts`)).default,
  };
});
