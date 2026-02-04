import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import { env } from "./env";

// Free non-reasoning models in priority order (max 3 — OpenRouter limit).
// OpenRouter's `models` parameter handles server-side fallback automatically.
// Using models from different providers for better fallback diversity.
export const FREE_MODELS = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "stepfun/step-3.5-flash:free",
  "google/gemma-3n-e2b-it:free",
];

// Initialize OpenRouter client
// Note: This requires env validation, so importing this will fail if Supabase env vars are missing.
// For test scripts, create the client directly instead of importing this.
export const openRouter = env.OPENROUTER_API_KEY
  ? new OpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    })
  : null;

/**
 * Zod schema for validating AI-generated line items (before transformation to LineItem)
 */
export const AILineItemSchema = z.object({
  description: z.string().min(1, "Description cannot be empty"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z
    .number()
    .int()
    .nonnegative("Unit price must be a non-negative integer (in cents)"),
});

// AI generation limit (matches overall max)
export const MAX_AI_LINE_ITEMS = 10;

export const AILineItemsArraySchema = z
  .array(AILineItemSchema)
  .min(1, "At least one line item is required")
  .max(MAX_AI_LINE_ITEMS, `Too many line items (max ${MAX_AI_LINE_ITEMS})`);

export type AILineItem = z.infer<typeof AILineItemSchema>;
export type AILineItems = z.infer<typeof AILineItemsArraySchema>;

/**
 * Extracts JSON from text, handling markdown code blocks and plain JSON
 */
export function extractJSON(text: string): string | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  // Try to extract from markdown code blocks first
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find a JSON array in the text
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0].trim();
  }

  // If the whole text looks like JSON, return it
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed;
  }

  return null;
}

/**
 * Parses and validates line items from OpenRouter response
 * @throws Error if parsing or validation fails
 */
export function parseAILineItems(
  rawContent: string | null | undefined
): AILineItems {
  // Handle empty or null content
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("Empty or invalid response from OpenRouter");
  }

  const trimmed = rawContent.trim();
  if (!trimmed) {
    throw new Error("Response content is empty");
  }

  // Extract JSON from the response
  const jsonString = extractJSON(trimmed);
  if (!jsonString) {
    throw new Error(
      `No valid JSON array found in response. Raw content preview: ${trimmed.slice(
        0,
        200
      )}`
    );
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON: ${
        error instanceof Error ? error.message : String(error)
      }. JSON string: ${jsonString.slice(0, 200)}`
    );
  }

  // Validate with Zod
  const validationResult = AILineItemsArraySchema.safeParse(parsed);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  return validationResult.data;
}

/**
 * Prompt template for generating quote line items.
 * Takes a job description and returns a formatted prompt for the AI.
 */
export function buildLineItemsPrompt(jobDescription: string): string {
  return `You generate professional quote line items. Always return valid JSON arrays only.

Given this job description, suggest 3-5 line items with realistic prices in USD. Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "description": "Brief description of the work item",
    "quantity": 1,
    "unitPrice": 10000
  }
]

Important:
- unitPrice is in cents (e.g., 10000 = $100.00)
- quantity should be a reasonable number (usually 1, but can be more for items like "hours" or "square feet")
- Be realistic with pricing for the type of work described
- Return ONLY the JSON array, no markdown, no explanation

Job description: ${jobDescription}`;
}
