"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "next-intl";
import { setUserLocale } from "@/server/locale";
import { Locale, supportedLocales } from "@/i18n/config";
import { useTranslation } from "@/i18n";

export function LocaleSwitcher() {
  const tr = useTranslation("common");
  const locale = useLocale();

  function onChange(locale: Locale) {
    setUserLocale(locale);
  }
  return (
    <Select onValueChange={onChange} defaultValue={locale}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder={tr("locale.changeLocale")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{tr("locale.header")}</SelectLabel>
          {supportedLocales.map((locale) => (
            <SelectItem key={locale.value} value={locale.value}>
              {locale.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
