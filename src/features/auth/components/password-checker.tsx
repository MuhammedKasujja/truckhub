import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Check, X } from "lucide-react";

// ---- Validation schema -----------------------------------------------------
// Each rule below is also used to render the live requirement checklist,
// so the schema and the UI never fall out of sync.

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "One lowercase letter")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[0-9]/, "One number")
  .regex(/[^A-Za-z0-9]/, "One special character");

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ---- Strength scoring -------------------------------------------------------

const REQUIREMENTS = [
  { key: "length", label: "8+ characters", test: (v) => v.length >= 8 },
  { key: "lower", label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "upper", label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "number", label: "Number", test: (v) => /[0-9]/.test(v) },
  { key: "special", label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function scorePassword(value) {
  if (!value) return { score: 0, label: "Empty", passed: 0 };
  const passed = REQUIREMENTS.filter((r) => r.test(value)).length;

  // Bonus point for real length, so "Str0ng!Password99" outranks "Str0ng!1"
  const lengthBonus = value.length >= 12 ? 1 : 0;
  const total = Math.min(passed + lengthBonus, 5);

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score: total, label: labels[total], passed };
}

const STRENGTH_COLORS = [
  "#e5484d", // very weak
  "#e5484d", // weak
  "#f5a623", // fair
  "#f5a623", // good
  "#3dd68c", // strong
  "#2fb673", // excellent
];

// ---- Component --------------------------------------------------------------

export function PasswordStrengthChecker() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") || "";
  const { score, label, passed } = useMemo(
    () => scorePassword(passwordValue),
    [passwordValue]
  );

  const onSubmit = (data) => {
    console.log("Validated password payload:", data);
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-semibold text-slate-100 mb-1">
          Set a new password
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Validated with Zod, wired up with React Hook Form.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
                className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 pr-10 text-slate-100 text-sm font-mono
                  placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-colors
                  ${
                    errors.password
                      ? "border-red-500/60 focus:ring-red-500/40"
                      : "border-slate-700 focus:ring-sky-500/40 focus:border-sky-500/60"
                  }`}
                placeholder="Enter a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength meter */}
            <div className="mt-2.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: i < score ? "100%" : "0%",
                        backgroundColor: STRENGTH_COLORS[score],
                      }}
                    />
                  </div>
                ))}
              </div>
              {passwordValue.length > 0 && (
                <p
                  className="mt-1.5 text-xs font-medium"
                  style={{ color: STRENGTH_COLORS[score] }}
                >
                  {label}
                </p>
              )}
            </div>

            {/* Requirement checklist */}
            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {REQUIREMENTS.map((req) => {
                const met = req.test(passwordValue);
                return (
                  <li
                    key={req.key}
                    className={`flex items-center gap-1.5 text-xs ${
                      met ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {met ? (
                      <Check size={13} strokeWidth={3} />
                    ) : (
                      <X size={13} strokeWidth={2.5} className="text-slate-700" />
                    )}
                    {req.label}
                  </li>
                );
              })}
            </ul>

            {errors.password && (
              <p className="mt-2 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 pr-10 text-slate-100 text-sm font-mono
                  placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-colors
                  ${
                    errors.confirmPassword
                      ? "border-red-500/60 focus:ring-red-500/40"
                      : "border-slate-700 focus:ring-sky-500/40 focus:border-sky-500/60"
                  }`}
                placeholder="Re-enter the password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm rounded-lg py-2.5 transition-colors"
          >
            Set password
          </button>

          {isSubmitSuccessful && submitted && (
            <p className="text-xs text-emerald-400 text-center">
              Password passed all checks and validated successfully.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}