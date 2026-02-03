import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import type { Quote } from "@/types";

// 5 checkout attempts per IP per 60 seconds
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!rateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS).success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId || typeof quoteId !== "string") {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const typedQuote = quote as Quote;

    // Only allow checkout for quotes that have been sent.
    // Line items and total are validated when marking a quote as sent.
    if (typedQuote.status !== "sent") {
      return NextResponse.json(
        { error: "This quote is not available for payment" },
        { status: 400 }
      );
    }

    // If there's already an active Stripe session for this quote, reuse it
    if (typedQuote.stripe_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(
          typedQuote.stripe_session_id
        );
        if (existing.status === "open" && existing.url) {
          return NextResponse.json({ url: existing.url });
        }
      } catch {
        // Session expired or invalid — create a new one below
      }
    }

    const baseUrl = env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: typedQuote.line_items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.description,
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${baseUrl}/q/${quoteId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/q/${quoteId}`,
      customer_email: typedQuote.client_email || undefined,
      metadata: {
        quote_id: quoteId,
        user_id: typedQuote.user_id,
      },
    });

    // Persist Stripe session ID so it's recorded even if the client never returns
    await supabase
      .from("quotes")
      .update({ stripe_session_id: session.id })
      .eq("id", quoteId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
