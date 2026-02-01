const stats = [
  { name: "Freelancers", count: "1,200+" },
  { name: "Agencies", count: "340+" },
  { name: "Consultants", count: "890+" },
  { name: "Contractors", count: "520+" },
];

export function SocialProof() {
  return (
    <section className="relative border-y border-border/50 bg-muted/30 py-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          {/* Trust text */}
          <p className="font-body text-sm font-medium text-muted-foreground">
            Trusted by{" "}
            <span className="text-brand-primary font-semibold">2,500+</span>{" "}
            professionals
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {stats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-8 lg:gap-12">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-brand-primary">
                    {item.count}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden h-6 w-px bg-border/60 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
