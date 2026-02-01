"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPassword } from "../_lib/actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "../_lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPassword(data);
      if (result.success) {
        setEmailSent(true);
        toast.success("Password reset link sent");
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-foreground">
              {form.getValues("email")}
            </span>
          </p>
        </div>
        <div className="space-y-3">
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
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Link
        href="/sign-in"
        className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}
