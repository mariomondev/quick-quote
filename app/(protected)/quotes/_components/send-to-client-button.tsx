"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { markQuoteAsSent } from "../_lib/actions";

interface SendToClientButtonProps {
  quoteId: string;
  disabled?: boolean;
}

export function SendToClientButton({
  quoteId,
  disabled = false,
}: SendToClientButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleSend = () => {
    startTransition(async () => {
      const result = await markQuoteAsSent(quoteId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const url = `${window.location.origin}/q/${quoteId}`;
      setQuoteUrl(url);
      setShowDialog(true);
      setCopied(false);
      router.refresh();
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quoteUrl);
      setCopied(true);
      toast.success("Quote link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <Button
        onClick={handleSend}
        disabled={disabled || isPending}
        className="gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send to Client
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quote Link Created</DialogTitle>
            <DialogDescription>
              Share this link with your client to view and pay the quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={quoteUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy the link above and send it to your client via email, SMS, or
              any messaging platform. They can view the quote and pay directly.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
