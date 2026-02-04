import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/_lib/actions";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  LogOut,
  Plus,
  Zap,
  Calendar,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Quote } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard - QuickQuote",
  description: "Manage your quotes and proposals",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userName = user.user_metadata?.full_name as string | undefined;

  // Fetch quotes for the current user
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quotes:", error);
  }

  const quotesList: Quote[] = (quotes || []) as Quote[];

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              QuickQuote
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline-block">
              {userName ?? user.email}
            </span>
            <ModeToggle />
            <form action={signOut}>
              <Button variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Your Quotes</h1>
            <p className="text-muted-foreground">
              Create and manage your professional quotes
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/quotes/new">
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Link>
          </Button>
        </div>

        {/* Quotes List */}
        {quotesList.length === 0 ? (
          <Empty className="min-h-[500px]">
            <EmptyMedia variant="icon">
              <Sparkles className="h-6 w-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No quotes yet</EmptyTitle>
              <EmptyDescription>
                Get started by creating your first quote. Use AI-powered
                suggestions to add line items quickly and build professional
                quotes in minutes.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="lg">
                <Link href="/quotes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first quote
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quotesList.map((quote) => (
              <Card
                key={quote.id}
                className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <CardTitle className="text-lg leading-tight">
                        {quote.client_name}
                      </CardTitle>
                      {quote.client_email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{quote.client_email}</span>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        quote.status === "paid"
                          ? "default"
                          : quote.status === "sent"
                          ? "secondary"
                          : "outline"
                      }
                      className="shrink-0 capitalize"
                    >
                      {quote.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote.job_description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {quote.job_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-1.5">
                      <div className="text-sm font-medium text-foreground">
                        {formatCurrency(quote.total_cents)}
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div>
                          {quote.line_items.length} line item
                          {quote.line_items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(quote.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:border-primary group-hover:text-primary"
                  >
                    <Link href={`/quotes/${quote.id}`}>
                      View Quote
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
