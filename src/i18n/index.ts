import type { TranslationValues } from "use-intl";
import { Namespaces, NamespaceKeys, GlobalKeys } from "./types";
import { useTranslations as useTranslationsBase } from "use-intl";

export { type GlobalKeys };

export function useTranslation<N extends Namespaces | undefined = undefined>(
  namespace?: N,
) {
  const t = useTranslationsBase(namespace);

  return <K extends N extends string ? NamespaceKeys<N> : GlobalKeys>(
    key: K,
    values?: TranslationValues,
  ) => {
    return t(key as string, values);
  };
}

export type TFunction = ReturnType<typeof useTranslation>