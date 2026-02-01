"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { LineItemsEditor } from "./line-items-editor";
import { quoteFormSchema, type QuoteFormValues } from "../_lib/schemas";
import { createQuote, updateQuote } from "../_lib/actions";
import type { Quote } from "@/types";

interface QuoteFormProps {
  quote?: Quote;
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(quote);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      client_name: quote?.client_name ?? "",
      client_email: quote?.client_email ?? "",
      job_description: quote?.job_description ?? "",
      line_items: quote?.line_items ?? [],
      status: quote?.status ?? "draft",
    },
  });

  const onSubmit = (data: QuoteFormValues) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateQuote(quote!.id, data)
        : await createQuote(data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (isEditing) {
        toast.success("Quote updated successfully");
      }
      // createQuote redirects, so no success toast needed
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Client Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Acme Corporation"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Client Email (optional)
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="client@example.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="job_description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Job Description</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Describe the work to be done..."
              className="min-h-[120px] resize-none"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="line_items"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <LineItemsEditor items={field.value} onChange={field.onChange} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Quote"}
        </Button>
      </div>
    </form>
  );
}
