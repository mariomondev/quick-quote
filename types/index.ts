// Quote and LineItem types matching the Supabase schema

export type QuoteStatus = "draft" | "sent" | "paid";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  total: number; // in cents (quantity * unitPrice)
}

export interface Quote {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string | null;
  job_description: string;
  line_items: LineItem[];
  total_cents: number;
  status: QuoteStatus;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

// Database insert type (omits auto-generated fields)
export type QuoteInsert = Omit<
  Quote,
  "id" | "user_id" | "created_at" | "updated_at"
>;

// Database update type (all fields optional except id)
export type QuoteUpdate = Partial<
  Omit<Quote, "id" | "user_id" | "created_at">
> &
  Pick<Quote, "id">;
