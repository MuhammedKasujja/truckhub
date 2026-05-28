import { cn } from "@/lib/utils";

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "group/page-header @container/page-header",
        "grid auto-rows-min items-start gap-x-4 gap-y-1 rounded-t-xl pb-5",

        // Small size support
        "group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:py-4",

        // When action exists → two columns
        "has-data-[slot=page-action]:grid-cols-[1fr_auto]",

        // When description exists → two rows
        "has-data-[slot=page-description]:grid-rows-[auto_auto]",

        // Border bottom support
        "[.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",

        className,
      )}
      {...props}
    />
  );
}

function PageTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-title"
      className={cn(
        "flex items-center gap-3 text-2xl font-semibold leading-tight",
        "group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

function PageAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        "mt-0.5", // fine-tune vertical alignment with title
        className,
      )}
      {...props}
    />
  );
}

// Optional: Icon component for consistency
function PageTitleIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-muted-foreground shrink-0",
        "group-data-[size=sm]/card:text-base",
        className,
      )}
      {...props}
    />
  );
}

export { PageHeader, PageTitle, PageDescription, PageAction, PageTitleIcon };
