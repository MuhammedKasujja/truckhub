import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { useTranslation } from "@/i18n";
import { useRouter } from "@tanstack/react-router";
import z from "zod";
import { toast } from "sonner";
import { login } from "@/features/auth/service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailField, PasswordField } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z.string().trim(),
});

export function LoginForm() {
  const router = useRouter();

  const tr = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error } = await login(values);
    if (isSuccess) {
      toast.success(`${tr("login_successfully")}`);
      router.replace("/dashboard");
    } else {
      toast.error(error!.message);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{tr("welcome_back")}</h1>
              <p className="text-muted-foreground text-balance">
                {tr("welcome_back_info")}
              </p>
            </div>
            <EmailField
              label={tr("common.form.email")}
              name={"email"}
              control={form.control}
              placeholder="user@mail.com"
            />
            <PasswordField
              label={tr("common.form.password")}
              name={"password"}
              control={form.control}
              placeholder="********"
            />
            <Field>
              <SubmitButton
                text={tr("common.form.login")}
                isSubmitting={form.formState.isSubmitting}
              />
            </Field>
          </FieldGroup>
        </form>
        <div className="bg-muted relative hidden md:block">
          <img
            src="/global.svg"
            alt="logo"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  );
}
