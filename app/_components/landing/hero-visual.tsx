"use client";

import { Check, DollarSign } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative animate-on-load animate-fade-up delay-400">
      {/* Gradient orb */}
      <div className="absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-brand-primary/30 via-brand-secondary/20 to-transparent blur-3xl animate-pulse-glow" />
      </div>

      {/* Main quote card */}
      <div className="relative animate-float">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-brand-primary/10 backdrop-blur-sm">
          {/* Quote header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quote #QQ-2024-0142
              </p>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Website Redesign
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
              <Check className="h-3 w-3" />
              Sent
            </span>
          </div>

          {/* Client info */}
          <div className="mb-4 rounded-lg bg-muted/50 p-3">
            <p className="font-body text-xs text-muted-foreground">Client</p>
            <p className="font-body text-sm font-medium">Acme Corporation</p>
          </div>

          {/* Line items */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-body text-sm text-foreground">
                UI/UX Design
              </span>
              <span className="font-body text-sm font-medium text-foreground">
                $2,400
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-body text-sm text-foreground">
                Frontend Development
              </span>
              <span className="font-body text-sm font-medium text-foreground">
                $4,800
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-body text-sm text-foreground">
                CMS Integration
              </span>
              <span className="font-body text-sm font-medium text-foreground">
                $1,200
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-brand-primary/5 p-3">
            <span className="font-display text-sm font-semibold text-foreground">
              Total
            </span>
            <span className="font-display text-xl font-bold text-brand-primary">
              $8,400
            </span>
          </div>
        </div>

        {/* Floating payment badge */}
        <div
          className="absolute -bottom-4 -right-4 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">Payment</p>
              <p className="font-body text-sm font-semibold text-green-500">
                Received
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
