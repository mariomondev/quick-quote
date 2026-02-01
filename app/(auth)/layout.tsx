import React from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/theme-toggle";
import { Zap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              QuickQuote
            </span>
          </Link>
          <ModeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          {/* Branding section */}
          <div className="mb-8 text-center">
            <Badge
              variant="outline"
              className="mb-4 gap-1.5 border-brand-primary/30 bg-brand-primary/5 px-3 py-1.5 text-brand-primary hover:bg-brand-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-body text-xs font-medium">
                AI-Powered Quoting
              </span>
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Professional quotes,
              <br />
              <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                delivered fast.
              </span>
            </h1>
            <p className="mt-3 font-body text-base text-muted-foreground">
              Create, send, and track quotes with AI-powered suggestions. Get
              paid faster with integrated Stripe checkout.
            </p>
          </div>

          {/* Form content */}
          <div className="rounded-2xl border border-border/60 bg-card/50 p-8 shadow-lg backdrop-blur-sm">
            {children}
          </div>

          {/* Social proof */}
          <div className="mt-8 text-center">
            <p className="font-body text-sm text-muted-foreground">
              Trusted by{" "}
              <span className="font-semibold text-foreground">2,500+</span>{" "}
              freelancers and agencies
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
