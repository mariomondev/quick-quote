import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import { DeleteButtonWrapper } from "./_components/delete-button-wrapper";
import { QuoteContent } from "./_components/quote-content";
import { QuoteSkeleton } from "./_components/quote-skeleton";

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

// Header component that renders immediately (static)
function QuoteHeader({ quoteId }: { quoteId: string }) {
  return (
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
        <Suspense fallback={null}>
          <DeleteButtonWrapper quoteId={quoteId} />
        </Suspense>
      </div>
    </header>
  );
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { id } = await params;

  return (
    <div className="min-h-svh bg-muted/30">
      <QuoteHeader quoteId={id} />
      <Suspense fallback={<QuoteSkeleton />}>
        <QuoteContent quoteId={id} />
      </Suspense>
    </div>
  );
}
