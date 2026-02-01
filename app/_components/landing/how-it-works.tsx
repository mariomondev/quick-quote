import { ScrollReveal } from "./scroll-reveal";
import { MessageSquare, Wand2, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Describe",
    description:
      "Tell us about the job in plain English. Include scope, deliverables, and any special requirements.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Customize",
    description:
      "AI suggests line items with smart pricing. Edit, add, or remove items until it's perfect.",
  },
  {
    number: "03",
    icon: Send,
    title: "Send & Get Paid",
    description:
      "Share the link with your client. They view, approve, and pay—all without leaving the quote.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-muted/30">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three steps to{" "}
            <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              getting paid
            </span>
          </h2>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            No complicated setup. No learning curve. Just describe your work and
            send.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute left-[16.67%] right-[16.67%] top-[60px] hidden h-[2px] bg-linear-to-r from-brand-primary/20 via-brand-primary/40 to-brand-primary/20 lg:block" />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 150}>
                <div className="relative flex flex-col items-center text-center lg:items-center">
                  {/* Step number with icon */}
                  <div className="relative mb-6">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-brand-primary/20 to-brand-secondary/20 blur-xl" />

                    {/* Main circle */}
                    <div className="relative flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-brand-primary/20 bg-card">
                      <span className="font-display text-3xl font-bold text-brand-primary">
                        {step.number}
                      </span>
                      <step.icon className="mt-1 h-6 w-6 text-muted-foreground" />
                    </div>

                    {/* Connector dot (desktop) */}
                    {index < steps.length - 1 && (
                      <div className="absolute -right-[calc(50%-60px)] top-[60px] hidden h-3 w-3 rounded-full bg-brand-primary lg:block" />
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="max-w-xs font-body text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
