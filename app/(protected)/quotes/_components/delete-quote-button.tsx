"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteQuote } from "../_lib/actions";
import type { QuoteStatus } from "@/types";

interface DeleteQuoteButtonProps {
  quoteId: string;
  status?: QuoteStatus;
}

export function DeleteQuoteButton({ quoteId, status }: DeleteQuoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  // Hide button entirely if quote is paid
  if (status === "paid") {
    return null;
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteQuote(quoteId);
      if (result?.error) {
        toast.error(result.error);
      }
      // deleteQuote redirects on success
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Quote</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this quote? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
