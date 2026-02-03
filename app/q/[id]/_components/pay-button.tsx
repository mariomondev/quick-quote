"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PayButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error || "Failed to start checkout");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handlePay}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Pay Now
        </>
      )}
    </Button>
  );
}
