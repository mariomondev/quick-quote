import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CreditCard, X } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const trustBadges = [
  { icon: Shield, text: "Free tier available" },
  { icon: CreditCard, text: "No credit card" },
  { icon: X, text: "Cancel anytime" },
];

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-background via-brand-primary/5 to-background" />
        <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-3xl border border-brand-primary/20 bg-card p-8 text-center shadow-xl shadow-brand-primary/5 sm:p-12 lg:p-16">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-linear-to-br from-brand-primary/20 to-brand-secondary/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-linear-to-tr from-brand-secondary/20 to-brand-primary/20 blur-2xl" />

            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Ready to quote{" "}
                <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  faster?
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg font-body text-lg text-muted-foreground">
                Join thousands of professionals who&apos;ve transformed their
                quoting process. Start creating beautiful, professional quotes
                today.
              </p>

              {/* CTA Button */}
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-base bg-brand-primary text-white hover:bg-brand-primary/90 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/25 font-body font-semibold"
                >
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                {trustBadges.map((badge) => (
                  <div
                    key={badge.text}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <badge.icon className="h-4 w-4 text-brand-primary" />
                    <span className="font-body text-sm">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
