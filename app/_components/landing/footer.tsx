import Link from "next/link";

import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                QuickQuote
              </span>
            </Link>
            <span className="font-body text-sm text-muted-foreground">
              &copy; {currentYear} QuickQuote. All rights reserved.
            </span>
          </div>

          {/* Links & Theme Toggle */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="h-4 w-px bg-border" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
