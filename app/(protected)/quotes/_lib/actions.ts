"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { quoteFormSchema, type QuoteFormValues } from "./schemas";
import {
  openRouter,
  FREE_MODELS,
  buildLineItemsPrompt,
  parseAILineItems,
} from "@/lib/openrouter";
import type { LineItem } from "@/types";

function calculateTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.total, 0);
}

export async function createQuote(data: QuoteFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const validated = quoteFormSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { client_name, client_email, job_description, line_items, status } =
    validated.data;

  const total_cents = calculateTotal(line_items as LineItem[]);

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      client_name,
      client_email: client_email || null,
      job_description,
      line_items,
      total_cents,
      status,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quote:", error);
    return { error: "Failed to create quote" };
  }

  revalidatePath("/dashboard");
  redirect(`/quotes/${quote.id}`);
}

export async function updateQuote(id: string, data: QuoteFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify quote exists and belongs to user before updating
  const { data: existingQuote } = await supabase
    .from("quotes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingQuote) {
    return { error: "Quote not found" };
  }

  const validated = quoteFormSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { client_name, client_email, job_description, line_items, status } =
    validated.data;

  const total_cents = calculateTotal(line_items as LineItem[]);

  const { error } = await supabase
    .from("quotes")
    .update({
      client_name,
      client_email: client_email || null,
      job_description,
      line_items,
      total_cents,
      status,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating quote:", error);
    return { error: "Failed to update quote" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${id}`);
  return { success: true };
}

export async function deleteQuote(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify quote exists and belongs to user before deleting
  const { data: existingQuote } = await supabase
    .from("quotes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingQuote) {
    return { error: "Quote not found" };
  }

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting quote:", error);
    return { error: "Failed to delete quote" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function markQuoteAsSent(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existingQuote } = await supabase
    .from("quotes")
    .select("id, status, line_items, total_cents")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingQuote) {
    return { error: "Quote not found" };
  }

  if (existingQuote.status === "paid") {
    return { error: "Cannot send a paid quote" };
  }

  if (!existingQuote.line_items || existingQuote.line_items.length === 0) {
    return { error: "Quote must have at least one line item" };
  }

  if (existingQuote.total_cents <= 0) {
    return { error: "Quote total must be greater than zero" };
  }

  const { error } = await supabase
    .from("quotes")
    .update({ status: "sent" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking quote as sent:", error);
    return { error: "Failed to update quote status" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${id}`);
  return { success: true };
}

export async function suggestLineItems(
  jobDescription: string
): Promise<{ line_items?: LineItem[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!jobDescription || jobDescription.trim().length === 0) {
    return { error: "Job description is required" };
  }

  if (!openRouter) {
    return { error: "AI service not configured" };
  }

  try {
    // Use single user message — some free providers reject system role.
    // OpenRouter SDK natively supports models fallback for server-side failover.
    // Exclude ModelRun provider which doesn't support free models.
    const completion = await openRouter.chat.send({
      models: FREE_MODELS,
      messages: [
        {
          role: "user",
          content: buildLineItemsPrompt(jobDescription),
        },
      ],
      stream: false,
    });

    const messageContent = completion.choices[0]?.message?.content;

    // Extract string content from message (handle both string and array formats)
    const rawContent =
      typeof messageContent === "string"
        ? messageContent
        : Array.isArray(messageContent)
        ? messageContent
            .map((item) =>
              typeof item === "string"
                ? item
                : item.type === "text"
                ? item.text
                : ""
            )
            .join("")
        : null;

    // Parse and validate the response using Zod
    const aiLineItems = parseAILineItems(rawContent);

    // Transform validated AI line items to LineItem format
    const lineItems: LineItem[] = aiLineItems.map((item, index) => ({
      id: `ai-${Date.now()}-${index}`,
      description: item.description.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    return { line_items: lineItems };
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate suggestions",
    };
  }
}
