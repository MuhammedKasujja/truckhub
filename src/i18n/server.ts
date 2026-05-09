"use server";
import type { TranslationValues } from "use-intl";
import { GlobalKeys, NamespaceKeys, Namespaces } from "./types";
import { getTranslations as getServerTranslations } from "use-intl/server";

export async function getTranslations<
  N extends Namespaces | undefined = undefined,
>(namespace?: N) {
  const t = await getServerTranslations(namespace);

  return <K extends N extends string ? NamespaceKeys<N> : GlobalKeys>(
    key: K,
    values?: TranslationValues,
  ) => {
    return t(key as string, values);
  };
}
