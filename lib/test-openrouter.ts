import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

config({ path: resolve(process.cwd(), ".env.local") });

import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Zod schema for line items validation
const LineItemSchema = z.object({
  description: z.string().min(1, "Description cannot be empty"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z
    .number()
    .int()
    .nonnegative("Unit price must be a non-negative integer (in cents)"),
});

const LineItemsArraySchema = z
  .array(LineItemSchema)
  .min(1, "At least one line item is required")
  .max(20, "Too many line items (max 20)");

type LineItems = z.infer<typeof LineItemsArraySchema>;

function buildLineItemsPrompt(jobDescription: string): string {
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

/**
 * Extracts JSON from text, handling markdown code blocks and plain JSON
 */
function extractJSON(text: string): string | null {
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
 */
function parseLineItems(rawContent: string | null | undefined): LineItems {
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
  const validationResult = LineItemsArraySchema.safeParse(parsed);
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  return validationResult.data;
}

const models = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "stepfun/step-3.5-flash:free",
  "google/gemma-3n-e2b-it:free",
];

async function testOpenRouter() {
  try {
    const prompt = buildLineItemsPrompt("Website redesign and development");

    const completion = await openrouter.chat.send({
      models,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const messageContent = completion.choices[0]?.message?.content;
    const usedModel = completion.model;

    // Extract string content from message (handle both string and array formats)
    const rawContent =
      typeof messageContent === "string"
        ? messageContent
        : Array.isArray(messageContent)
        ? messageContent
            .map((item) =>
              typeof item === "string"
                ? item
                : item.type === "text"
                ? item.text
                : ""
            )
            .join("")
        : null;

    // Parse and validate the response
    const lineItems = parseLineItems(rawContent);

    // Log success
    console.log(JSON.stringify(lineItems, null, 2));
    console.log(usedModel);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
    }
    process.exit(1);
  }
}

testOpenRouter();
