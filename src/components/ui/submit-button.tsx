import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "./button";
import { VariantProps } from "class-variance-authority";

export function SubmitButton({
  isSubmitting = false,
  disabled = false,
  loadingText,
  text = "Submit",
  asChild = false,
  type = "submit",
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isSubmitting?: boolean;
    text?: string;
    loadingText?: string;
  }) {
  const loadingLabel = loadingText ?? `${text}....`;
  return (
    <Button type={type} {...props} disabled={disabled ?? isSubmitting}>
      {isSubmitting && <Loader2 className="size-4 animate-spin" />}
      {isSubmitting ? loadingLabel : text}
    </Button>
  );
}
