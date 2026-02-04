"use client";

import { useTransition } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import type { Quote } from "@/types";

interface PdfButtonProps {
  quote: Quote;
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PdfButton({ quote }: PdfButtonProps) {
  const [isPending, startTransition] = useTransition();

  const generatePDF = () => {
    startTransition(async () => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginL = 24;
        const marginR = 24;
        const contentWidth = pageWidth - marginL - marginR;

        // Colors
        const black = [17, 24, 39] as const; // gray-900
        const darkGray = [55, 65, 81] as const; // gray-700
        const medGray = [107, 114, 128] as const; // gray-500
        const lightGray = [156, 163, 175] as const; // gray-400
        const borderColor = [229, 231, 235] as const; // gray-200
        const bgLight = [248, 250, 252] as const; // slate-50
        const accent = [37, 99, 235] as const; // blue-600

        let y = 0;

        // ── Top accent bar ──
        doc.setFillColor(...accent);
        doc.rect(0, 0, pageWidth, 2.5, "F");

        y = 16;

        // ── Brand + QUOTE label ──
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...black);
        doc.text("QuickQuote", marginL, y);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...medGray);
        doc.text(
          `QUOTE #${quote.id.slice(0, 8).toUpperCase()}`,
          pageWidth - marginR,
          y,
          { align: "right" }
        );

        y += 3;
        doc.setDrawColor(...accent);
        doc.setLineWidth(0.5);
        doc.line(marginL, y, marginL + 22, y);

        y += 6;

        // ── Two-column: Bill To + Quote details ──
        const infoStartY = y;

        // Right column - details box
        const detailBoxW = 64;
        const detailBoxX = pageWidth - marginR - detailBoxW;
        const detailBoxH = 24;
        doc.setFillColor(...bgLight);
        doc.roundedRect(detailBoxX, infoStartY - 2, detailBoxW, detailBoxH, 1.5, 1.5, "F");
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.roundedRect(detailBoxX, infoStartY - 2, detailBoxW, detailBoxH, 1.5, 1.5, "S");

        const detailPadX = detailBoxX + 4;
        const detailValX = detailBoxX + detailBoxW - 4;
        let detailY = infoStartY + 4;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...medGray);
        doc.text("Date", detailPadX, detailY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...black);
        doc.text(formatShortDate(quote.created_at), detailValX, detailY, { align: "right" });

        detailY += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...medGray);
        doc.text("Status", detailPadX, detailY);

        // Status badge
        const statusLabel = quote.status.toUpperCase();
        const statusStyles: Record<
          string,
          { text: [number, number, number]; bg: [number, number, number] }
        > = {
          paid: { text: [22, 163, 74], bg: [220, 252, 231] },
          sent: { text: [37, 99, 235], bg: [219, 234, 254] },
          draft: { text: [107, 114, 128], bg: [243, 244, 246] },
        };
        const sStyle = statusStyles[quote.status] || statusStyles.draft;
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        const badgeW = doc.getTextWidth(statusLabel) + 4;
        const badgeX = detailValX - badgeW;
        doc.setFillColor(...sStyle.bg);
        doc.roundedRect(badgeX, detailY - 2.8, badgeW, 4, 1, 1, "F");
        doc.setTextColor(...sStyle.text);
        doc.text(statusLabel, badgeX + 2, detailY, { align: "left" });

        detailY += 6;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...medGray);
        doc.text("Amount", detailPadX, detailY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...black);
        doc.text(formatCents(quote.total_cents), detailValX, detailY, { align: "right" });

        // Left column - Bill To
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...accent);
        doc.text("BILL TO", marginL, infoStartY + 1);

        let clientY = infoStartY + 7;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...black);
        doc.text(quote.client_name, marginL, clientY);
        clientY += 5;

        if (quote.client_email) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkGray);
          doc.text(quote.client_email, marginL, clientY);
        }

        y = infoStartY + detailBoxH + 4;

        // ── Job Description ──
        if (quote.job_description) {
          doc.setDrawColor(...borderColor);
          doc.setLineWidth(0.2);
          doc.line(marginL, y, pageWidth - marginR, y);
          y += 5;

          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...accent);
          doc.text("PROJECT DESCRIPTION", marginL, y);
          y += 4.5;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkGray);
          const descLines = doc.splitTextToSize(quote.job_description, contentWidth);
          descLines.forEach((line: string) => {
            doc.text(line, marginL, y);
            y += 3.8;
          });
          y += 3;
        }

        // ── Line Items Table ──
        // Column positions
        const col = {
          desc: marginL,
          qty: marginL + contentWidth * 0.58,
          price: marginL + contentWidth * 0.76,
          total: marginL + contentWidth - 4,
        };
        const rowH = 8;

        // Table header
        const headerH = 7;
        doc.setFillColor(...accent);
        doc.rect(marginL, y, contentWidth, headerH, "F");

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("DESCRIPTION", col.desc + 3, y + 4.5);
        doc.text("QTY", col.qty, y + 4.5, { align: "center" });
        doc.text("UNIT PRICE", col.price, y + 4.5, { align: "right" });
        doc.text("AMOUNT", col.total, y + 4.5, { align: "right" });

        y += headerH;

        // Table rows
        quote.line_items.forEach((item, index) => {
          if (y > pageHeight - 60) {
            doc.addPage();
            y = 16;
          }

          const rowTop = y;
          const isEven = index % 2 === 0;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          const descLines = doc.splitTextToSize(item.description, contentWidth * 0.52);
          const actualRowH = Math.max(rowH, descLines.length * 3.8 + 3);

          // Alternating row bg
          if (!isEven) {
            doc.setFillColor(...bgLight);
            doc.rect(marginL, rowTop, contentWidth, actualRowH, "F");
          }

          // Description text
          doc.setTextColor(...black);
          let textY = rowTop + 5;
          descLines.forEach((line: string) => {
            doc.text(line, col.desc + 3, textY);
            textY += 3.8;
          });

          // Qty, price, total
          const dataY = rowTop + 5;
          doc.setTextColor(...darkGray);
          doc.text(item.quantity.toString(), col.qty, dataY, { align: "center" });
          doc.text(formatCents(item.unitPrice), col.price, dataY, { align: "right" });
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...black);
          doc.text(formatCents(item.total), col.total, dataY, { align: "right" });

          y = rowTop + actualRowH;

          // Row separator
          doc.setDrawColor(...borderColor);
          doc.setLineWidth(0.15);
          doc.line(marginL, y, pageWidth - marginR, y);
        });

        // ── Totals section ──
        y += 5;
        const totalsLabelX = col.price;
        const totalsValueX = col.total;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...medGray);
        doc.text("Subtotal", totalsLabelX, y, { align: "right" });
        doc.setTextColor(...black);
        doc.text(formatCents(quote.total_cents), totalsValueX, y, { align: "right" });

        y += 3;
        doc.setDrawColor(...accent);
        doc.setLineWidth(0.6);
        doc.line(marginL + contentWidth * 0.55, y, pageWidth - marginR, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...black);
        doc.text("Total Due", totalsLabelX, y, { align: "right" });
        doc.setFontSize(12);
        doc.text(formatCents(quote.total_cents), totalsValueX, y, { align: "right" });

        // ── Notes / Thank you section ──
        y += 18;
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.line(marginL, y, pageWidth - marginR, y);
        y += 6;

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...black);
        doc.text("Thank you for your business!", marginL, y);
        y += 5;

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...medGray);
        doc.text(
          "If you have any questions about this quote, please don't hesitate to reach out.",
          marginL,
          y
        );
        y += 10;

        // Terms section
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...accent);
        doc.text("TERMS & CONDITIONS", marginL, y);
        y += 4.5;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...lightGray);
        const terms = [
          "This quote is valid for 30 days from the date of issue.",
          "Payment is due upon receipt unless otherwise agreed.",
          "All prices are in USD.",
        ];
        terms.forEach((term) => {
          doc.text(`\u2022  ${term}`, marginL, y);
          y += 4;
        });

        // ── Footer ──
        const footerY = pageHeight - 10;
        doc.setFillColor(...accent);
        doc.rect(0, pageHeight - 2.5, pageWidth, 2.5, "F");

        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.line(marginL, footerY - 4, pageWidth - marginR, footerY - 4);

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...lightGray);
        doc.text("Generated by QuickQuote", marginL, footerY);
        doc.text(formatShortDate(quote.created_at), pageWidth - marginR, footerY, {
          align: "right",
        });

        // Generate filename
        const safeClientName = quote.client_name
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();
        const dateStr = new Date(quote.created_at)
          .toISOString()
          .split("T")[0];
        const filename = `quote-${safeClientName}-${dateStr}.pdf`;

        doc.save(filename);
        toast.success("PDF generated successfully!");
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isPending}
      variant="outline"
      className="gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
