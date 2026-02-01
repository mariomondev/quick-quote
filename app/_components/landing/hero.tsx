import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import { HeroVisual } from "./hero-visual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-linear-to-br from-brand-primary/20 via-brand-primary/5 to-transparent blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/4 rounded-full bg-linear-to-tl from-brand-secondary/20 via-brand-secondary/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div className="max-w-xl">
            {/* Eyebrow badge */}
            <div className="animate-on-load animate-fade-up delay-100">
              <Badge
                variant="outline"
                className="mb-6 gap-1.5 border-brand-primary/30 bg-brand-primary/5 px-3 py-1.5 text-brand-primary hover:bg-brand-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-body text-xs font-medium">
                  AI-Powered Quoting
                </span>
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="animate-on-load animate-fade-up delay-200 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Stop losing deals to{" "}
              <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                slow quotes.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="animate-on-load animate-fade-up delay-300 mt-6 font-body text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Create professional quotes in minutes, not hours. AI suggests line
              items. Stripe collects payments.
            </p>

            {/* CTAs */}
            <div className="animate-on-load animate-fade-up delay-400 mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-brand-primary text-white hover:bg-brand-primary/90 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/25 font-body font-semibold"
              >
                <Link href="/sign-up">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-body font-medium"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            {/* Trust text */}
            <p className="animate-on-load animate-fade-up delay-500 mt-6 font-body text-sm text-muted-foreground">
              No credit card required &bull; Free forever for 5 quotes/month
            </p>
          </div>

          {/* Visual */}
          <div className="relative lg:justify-self-end">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
