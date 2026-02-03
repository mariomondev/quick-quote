import type { Metadata } from "next";
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
import { ArrowLeft, Zap, Mail, Calendar } from "lucide-react";
import { QuoteForm } from "../_components/quote-form";
import { DeleteQuoteButton } from "../_components/delete-quote-button";
import { SendToClientButton } from "../_components/send-to-client-button";
import type { Quote } from "@/types";

interface QuotePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: QuotePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Quote ${id.slice(0, 8)} - QuickQuote`,
    description: "View and edit quote",
  };
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

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !quote) {
    notFound();
  }

  const typedQuote = quote as Quote;

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to dashboard</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                QuickQuote
              </span>
            </div>
          </div>
          <DeleteQuoteButton quoteId={id} />
        </div>
      </header>

      {/* Main content */}
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
            <SendToClientButton
              quoteId={id}
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
    </div>
  );
}
