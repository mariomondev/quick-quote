import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/_lib/actions";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, LogOut, Plus, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - QuickQuote",
  description: "Manage your quotes and proposals",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userName = user.user_metadata?.full_name as string | undefined;

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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Quotes</h1>
            <p className="text-muted-foreground">
              Create and manage your professional quotes
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>

        {/* Empty state */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">No quotes yet</CardTitle>
              <CardDescription className="max-w-sm">
                Get started by creating your first quote. Use AI-powered
                suggestions to add line items quickly.
              </CardDescription>
            </CardHeader>
            <Button className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create your first quote
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
