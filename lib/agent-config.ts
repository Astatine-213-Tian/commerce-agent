import { tool } from "@openai/agents";
import { z } from "zod";
import type { Id } from "@/convex/_generated/dataModel";
import { ProductSearchResult, Category } from "@/types";

/**
 * Configuration for the commerce voice agent
 */
export const AGENT_CONFIG = {
  /**
   * Agent name
   */
  name: "Commerce Assistant",

  /**
   * Realtime model to use
   */
  model: "gpt-realtime-mini" as const,

  /**
   * System instructions for the agent
   */
  instructions: `You are an AI shopping assistant for an e-commerce platform. Your role is to help users discover and find products through natural conversation.

Key behaviors:
- Be friendly, helpful, and concise
- Use the listCategories tool to show available product categories when users want to browse
- Use the searchProductsByText tool when users describe what they're looking for
- Use the searchProductsByImage tool when users upload images to find similar products
- Present product recommendations clearly with name, brand, price, and brief description
- Ask clarifying questions about budget, preferences, or specific features when helpful
- After showing search results, offer to refine the search or help with other questions

Always respond with the search results after executing a tool so users know what you found.`,

  /**
   * Audio transcription settings
   */
  transcription: {
    model: "whisper-1" as const,
  },
} as const;

/**
 * Create tools that execute Convex actions and queries.
 *
 * @param searchByText - Convex action for text search
 * @param searchByImage - Convex action for image search
 * @param listCategories - Convex query to list all categories
 */
export function createAgentTools(
  searchByText: (args: {
    textQuery: string;
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<ProductSearchResult[]>,
  searchByImage: (args: {
    imageId: Id<"_storage">;
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<ProductSearchResult[]>,
  listCategories: () => Promise<Category[]>
) {
  const searchProductsByTextTool = tool({
    name: "searchProductsByText",
    description:
      "Search for products using a text description. Returns up to 10 products ranked by relevance with name, brand, price, category, description, and image URL.",
    parameters: z.object({
      textQuery: z
        .string()
        .describe("The search query (e.g., 'wireless headphones', 'red sneakers')"),
      minPrice: z
        .number()
        .nullable()
        .optional()
        .describe("Optional minimum price filter in dollars (inclusive)"),
      maxPrice: z
        .number()
        .nullable()
        .optional()
        .describe("Optional maximum price filter in dollars (inclusive)"),
    }),
    execute: async (input) => {
      try {
        const results = await searchByText({
          textQuery: input.textQuery,
          minPrice: input.minPrice ?? undefined,
          maxPrice: input.maxPrice ?? undefined,
        });
        return results;
      } catch (error) {
        console.error("Error in searchProductsByText:", error);
        return { error: String(error) };
      }
    },
  });

  const searchProductsByImageTool = tool({
    name: "searchProductsByImage",
    description:
      "Search for products similar to an uploaded image. User must upload image first. Returns up to 10 similar products with details.",
    parameters: z.object({
      imageId: z
        .string()
        .describe("Convex storage ID of the uploaded image"),
      minPrice: z
        .number()
        .nullable()
        .optional()
        .describe("Optional minimum price filter in dollars (inclusive)"),
      maxPrice: z
        .number()
        .nullable()
        .optional()
        .describe("Optional maximum price filter in dollars (inclusive)"),
    }),
    execute: async (input) => {
      try {
        const results = await searchByImage({
          imageId: input.imageId as Id<"_storage">,
          minPrice: input.minPrice ?? undefined,
          maxPrice: input.maxPrice ?? undefined,
        });
        return results;
      } catch (error) {
        console.error("Error in searchProductsByImage:", error);
        return { error: String(error) };
      }
    },
  });

  const listCategoriesTool = tool({
    name: "listCategories",
    description:
      "List all available product categories. Use this to help users browse by category or understand what types of products are available.",
    parameters: z.object({}),
    execute: async () => {
      try {
        const categories = await listCategories();
        return categories;
      } catch (error) {
        console.error("Error in listCategories:", error);
        return { error: String(error) };
      }
    },
  });

  return [searchProductsByTextTool, searchProductsByImageTool, listCategoriesTool];
}
