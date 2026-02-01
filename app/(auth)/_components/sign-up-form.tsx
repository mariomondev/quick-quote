"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { signUp } from "../_lib/actions";
import { signUpSchema, type SignUpInput } from "../_lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

const passwordRequirements = [
  { label: "At least 8 characters", regex: /.{8,}/ },
  { label: "One uppercase letter", regex: /[A-Z]/ },
  { label: "One lowercase letter", regex: /[a-z]/ },
  { label: "One number", regex: /[0-9]/ },
];

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit(data: SignUpInput) {
    startTransition(async () => {
      const result = await signUp(data);
      if (result.success) {
        setEmailSent(true);
        toast.success("Check your email to verify your account");
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Account created</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">
              {form.getValues("email")}
            </span>
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/sign-in">Continue to sign in</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Start building professional quotes in minutes
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="full_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Your full name"
                autoComplete="name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {password && (
                <ul className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => {
                    const met = req.regex.test(password);
                    return (
                      <li
                        key={req.label}
                        className={`flex items-center gap-2 text-xs ${
                          met
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`h-1 w-1 rounded-full ${
                            met
                              ? "bg-emerald-600 dark:bg-emerald-400"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
