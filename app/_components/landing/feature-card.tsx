import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  size?: "default" | "large";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  size = "default",
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative h-full rounded-2xl border border-border/60 bg-card/50 p-6 transition-all duration-300",
        "hover:border-brand-primary/30 hover:bg-card hover:shadow-lg hover:shadow-brand-primary/5",
        "hover:-translate-y-0.5",
        size === "large" && "p-8",
        className
      )}
    >
      {/* Gradient border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-brand-primary/20 via-transparent to-brand-secondary/20" />
        <div className="absolute inset-0 rounded-2xl bg-card" />
      </div>

      <div className="relative">
        {/* Icon */}
        <div
          className={cn(
            "mb-4 inline-flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary/15 group-hover:scale-110",
            size === "large" ? "h-14 w-14" : "h-12 w-12"
          )}
        >
          <Icon className={cn(size === "large" ? "h-7 w-7" : "h-6 w-6")} />
        </div>

        {/* Content */}
        <h3
          className={cn(
            "mb-2 font-display font-semibold text-foreground",
            size === "large" ? "text-xl" : "text-lg"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "font-body leading-relaxed text-muted-foreground",
            size === "large" ? "text-base" : "text-sm"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
