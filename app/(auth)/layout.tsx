import { ModeToggle } from "@/components/theme/theme-toggle";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[2fr_3fr]">
      {/* Left panel - Branding */}
      <div className="relative hidden lg:flex flex-col justify-between bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-10 text-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-linear-to-br from-indigo-500/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-linear-to-tl from-violet-500/20 to-transparent blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            QuickQuote
          </span>
        </div>

        {/* Tagline and social proof */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Professional quotes,
              <br />
              delivered fast.
            </h1>
            <p className="text-lg text-white/70">
              Create, send, and track quotes with AI-powered suggestions. Get
              paid faster with integrated Stripe checkout.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-zinc-800 bg-linear-to-br from-zinc-600 to-zinc-700"
                />
              ))}
            </div>
            <span>Trusted by 2,500+ freelancers and agencies</span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-sm text-white/50">
          &copy; {new Date().getFullYear()} QuickQuote. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form area */}
      <div className="flex flex-col">
        {/* Header with theme toggle */}
        <header className="flex h-16 items-center justify-between px-6 lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <Zap className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              QuickQuote
            </span>
          </div>
          <ModeToggle />
        </header>

        {/* Form content */}
        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
