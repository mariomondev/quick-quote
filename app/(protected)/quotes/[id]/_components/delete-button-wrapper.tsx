import { createClient } from "@/lib/supabase/server";
import { DeleteQuoteButton } from "../../_components/delete-quote-button";
import type { QuoteStatus } from "@/types";

interface DeleteButtonWrapperProps {
  quoteId: string;
}

export async function DeleteButtonWrapper({
  quoteId,
}: DeleteButtonWrapperProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch only status for delete button visibility
  let quoteStatus: QuoteStatus | undefined;
  if (user) {
    const { data: quote } = await supabase
      .from("quotes")
      .select("status")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .single();
    quoteStatus = quote?.status as QuoteStatus | undefined;
  }

  return <DeleteQuoteButton quoteId={quoteId} status={quoteStatus} />;
}
