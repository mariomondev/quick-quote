import "server-only";

import Stripe from "stripe";
import { env } from "./env";

// Initialize Stripe client
// Returns null if Stripe keys are not configured
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;
