import { useRef } from "react";

export function useTokenInsertion() {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertToken = (
    token: string,
    value: string,
    onChange: (value: string) => void,
  ) => {
    const input = inputRef.current;

    if (!input) return;

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;

    const next =
      value.substring(0, start) +
      token +
      value.substring(end);

    onChange(next);

    requestAnimationFrame(() => {
      const cursor = start + token.length;

      input.focus();
      input.setSelectionRange(cursor, cursor);
    });
  };

  return {
    inputRef,
    insertToken,
  };
}