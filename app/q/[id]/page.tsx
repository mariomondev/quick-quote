import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap } from "lucide-react";
import { PayButton } from "./_components/pay-button";
import type { Quote } from "@/types";

interface PublicQuotePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export async function generateMetadata({
  params,
}: PublicQuotePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Quote ${id.slice(0, 8)} - QuickQuote`,
    description: "View and pay your quote",
  };
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function PublicQuotePage({
  params,
  searchParams,
}: PublicQuotePageProps) {
  const [{ id }, { session_id }] = await Promise.all([params, searchParams]);

  const supabase = await createClient();

  // RLS policy "Anyone can view sent and paid quotes" allows anon access here.
  // Draft quotes are filtered out by RLS — the notFound() below is defense-in-depth.
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !quote) {
    notFound();
  }

  const typedQuote = quote as Quote;

  // Only show quotes that have been sent or paid — drafts are not public
  if (typedQuote.status === "draft") {
    notFound();
  }

  // Determine if the client just completed payment.
  // The webhook is the source of truth for DB updates — this check is purely
  // so the client sees immediate feedback if the webhook hasn't fired yet.
  let justPaid = false;
  if (session_id && typedQuote.status === "paid") {
    justPaid = true;
  } else if (session_id && typedQuote.status === "sent" && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (
        session.payment_status === "paid" &&
        session.metadata?.quote_id === id
      ) {
        justPaid = true;
      }
    } catch {
      // Session retrieval failed — client will see current DB status
    }
  }

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              QuickQuote
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success banner */}
        {justPaid && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Payment successful! Thank you for your payment.
            </p>
          </div>
        )}

        {/* Quote header */}
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Quote for {typedQuote.client_name}
            </h1>
            <Badge
              variant={typedQuote.status === "paid" ? "default" : "secondary"}
            >
              {typedQuote.status}
            </Badge>
          </div>
          {typedQuote.job_description && (
            <p className="text-sm text-muted-foreground">
              {typedQuote.job_description}
            </p>
          )}
        </div>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 text-right font-medium">Qty</th>
                    <th className="pb-3 pr-4 text-right font-medium">
                      Unit Price
                    </th>
                    <th className="pb-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {typedQuote.line_items.map((item, i) => (
                    <tr key={item.id ?? i} className="border-b last:border-0">
                      <td className="py-3 pr-4">{item.description}</td>
                      <td className="py-3 pr-4 text-right">{item.quantity}</td>
                      <td className="py-3 pr-4 text-right">
                        {formatCents(item.unitPrice)}
                      </td>
                      <td className="py-3 text-right">
                        {formatCents(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="pt-4 text-right font-semibold"
                    >
                      Total
                    </td>
                    <td className="pt-4 text-right text-lg font-bold">
                      {formatCents(typedQuote.total_cents)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pay button — only show for sent (unpaid) quotes */}
        {typedQuote.status === "sent" && !justPaid && (
          <div className="mt-6 flex justify-end">
            <PayButton quoteId={id} />
          </div>
        )}
      </main>
    </div>
  );
}
