import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(
      "Webhook signature verification failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const quoteId = session.metadata?.quote_id;

    if (quoteId && session.payment_status === "paid") {
      const supabase = createServiceClient();

      // Only update quotes that are still in "sent" status (idempotent)
      const { error } = await supabase
        .from("quotes")
        .update({ status: "paid", stripe_session_id: session.id })
        .eq("id", quoteId)
        .eq("status", "sent");

      if (error) {
        console.error("Failed to update quote after payment:", error);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }

      revalidatePath("/dashboard");
      revalidatePath(`/quotes/${quoteId}`);
      revalidatePath(`/q/${quoteId}`);
    }
  }

  return NextResponse.json({ received: true });
}
