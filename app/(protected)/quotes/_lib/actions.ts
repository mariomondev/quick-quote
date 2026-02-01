"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { quoteFormSchema, type QuoteFormValues } from "./schemas";
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
