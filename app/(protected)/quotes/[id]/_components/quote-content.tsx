import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar } from "lucide-react";
import { QuoteForm } from "../../_components/quote-form";
import { SendToClientButton } from "../../_components/send-to-client-button";
import { PdfButton } from "../../_components/pdf-button";
import type { Quote } from "@/types";

interface QuoteContentProps {
  quoteId: string;
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function QuoteContent({ quoteId }: QuoteContentProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .single();

  if (error || !quote) {
    notFound();
  }

  const typedQuote = quote as Quote;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Quote Info Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {typedQuote.client_name}
            </h1>
            <Badge
              variant={
                typedQuote.status === "paid"
                  ? "default"
                  : typedQuote.status === "sent"
                  ? "secondary"
                  : "outline"
              }
            >
              {typedQuote.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {typedQuote.client_email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {typedQuote.client_email}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Created {formatDate(typedQuote.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PdfButton quote={typedQuote} />
          <SendToClientButton
            quoteId={quoteId}
            disabled={
              typedQuote.status === "paid" ||
              typedQuote.line_items.length === 0 ||
              typedQuote.total_cents <= 0
            }
          />
        </div>
      </div>

      {typedQuote.status === "draft" ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Quote</CardTitle>
            <CardDescription>
              Update the quote details below. Changes are saved when you click
              &quot;Save Changes&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuoteForm quote={typedQuote} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
            <CardDescription>
              This quote has been {typedQuote.status} and can no longer be
              edited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {typedQuote.job_description && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Job Description
                </p>
                <p className="text-sm">{typedQuote.job_description}</p>
              </div>
            )}
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
                      <td className="py-3 pr-4 text-right">
                        {item.quantity}
                      </td>
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
                    <td colSpan={3} className="pt-4 text-right font-semibold">
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
      )}
    </main>
  );
}
