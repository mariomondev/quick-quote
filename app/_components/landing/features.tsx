import {
  Sparkles,
  Zap,
  CreditCard,
  LayoutDashboard,
  CloudOff,
  Moon,
} from "lucide-react";
import { FeatureCard } from "./feature-card";
import { ScrollReveal } from "./scroll-reveal";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Line Items",
    description:
      "Describe your project in plain English and let AI suggest accurate line items with pricing. Save hours on every quote.",
    size: "large" as const,
    className: "md:col-span-2 lg:col-span-2",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Average quote creation time: 3 minutes. Your clients get quotes while they're still interested.",
    size: "default" as const,
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    icon: CreditCard,
    title: "Stripe Payments",
    description:
      "Built-in payment links. Clients pay directly from the quote. Funds in your account fast.",
    size: "default" as const,
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    icon: CloudOff,
    title: "Works Offline",
    description:
      "PWA support means you can create quotes anywhere, even without internet. Syncs when you're back online.",
    size: "default" as const,
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description:
      "Easy on the eyes, day or night. Automatic or manual theme switching.",
    size: "default" as const,
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    icon: LayoutDashboard,
    title: "Quote Dashboard",
    description:
      "Track every quote's status at a glance. See what's pending, accepted, and paid—all in one place.",
    size: "large" as const,
    className: "md:col-span-2 lg:col-span-2",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to{" "}
            <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              quote faster
            </span>
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            From AI suggestions to payment collection, QuickQuote handles the
            heavy lifting so you can focus on your craft.
          </p>
        </ScrollReveal>

        {/* Bento grid */}
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              delay={index * 75}
              className={feature.className}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                size={feature.size}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
