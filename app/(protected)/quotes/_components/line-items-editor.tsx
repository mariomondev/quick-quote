"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { suggestLineItems } from "../_lib/actions";
import { MAX_LINE_ITEMS } from "../_lib/schemas";
import type { LineItem } from "@/types";

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  jobDescription?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2);
}

function parseCurrency(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

export function LineItemsEditor({
  items,
  onChange,
  jobDescription,
}: LineItemsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const addItem = () => {
    if (items.length >= MAX_LINE_ITEMS) {
      toast.error(`Maximum ${MAX_LINE_ITEMS} line items allowed per quote`);
      return;
    }
    onChange([
      ...items,
      {
        id: generateId(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const performGeneration = () => {
    if (!jobDescription || jobDescription.trim().length === 0) {
      toast.error("Please enter a job description first");
      return;
    }

    startTransition(async () => {
      const result = await suggestLineItems(jobDescription);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.line_items && result.line_items.length > 0) {
        // Ensure AI-generated items don't exceed the limit
        const itemsToAdd = result.line_items.slice(0, MAX_LINE_ITEMS);
        if (itemsToAdd.length < result.line_items.length) {
          toast.warning(
            `Generated ${result.line_items.length} items, but only ${itemsToAdd.length} were added (max ${MAX_LINE_ITEMS} allowed)`
          );
        }
        // Replace existing items with AI-generated ones
        onChange(itemsToAdd);
        toast.success(`Generated ${itemsToAdd.length} line items`);
      } else {
        toast.error("No line items generated");
      }
    });
  };

  const generateWithAI = () => {
    // If there are existing items, show confirmation dialog
    if (items.length > 0) {
      setShowConfirmDialog(true);
    } else {
      // No existing items, proceed directly
      performGeneration();
    }
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">Line Items</Label>
          <span className="text-xs text-muted-foreground">
            ({items.length}/{MAX_LINE_ITEMS})
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={generateWithAI}
            disabled={
              isPending || !jobDescription || jobDescription.trim().length === 0
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={items.length >= MAX_LINE_ITEMS}
            title={
              items.length >= MAX_LINE_ITEMS
                ? `Maximum ${MAX_LINE_ITEMS} line items allowed`
                : "Add a new line item"
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No line items yet. Click &quot;Add Item&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-[1fr_80px_100px_auto]"
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor={`description-${item.id}`}
                  className="text-xs text-muted-foreground"
                >
                  Description
                </Label>
                <Input
                  id={`description-${item.id}`}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                  placeholder={`Item ${index + 1}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`qty-${item.id}`}
                  className="text-xs text-muted-foreground"
                >
                  Qty
                </Label>
                <Input
                  id={`qty-${item.id}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, {
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`price-${item.id}`}
                  className="text-xs text-muted-foreground"
                >
                  Unit Price
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id={`price-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7"
                    value={formatCurrency(item.unitPrice)}
                    onChange={(e) =>
                      updateItem(item.id, {
                        unitPrice: parseCurrency(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5 sm:hidden">
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <div className="flex h-9 items-center rounded-md bg-muted px-3 text-sm font-medium">
                    ${formatCurrency(item.total)}
                  </div>
                </div>
                <div className="hidden h-9 min-w-[80px] items-center justify-end text-sm font-medium sm:flex">
                  ${formatCurrency(item.total)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">${formatCurrency(total)}</p>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing line items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all {items.length} existing line item
              {items.length !== 1 ? "s" : ""} with AI-generated suggestions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                performGeneration();
              }}
            >
              Replace Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
