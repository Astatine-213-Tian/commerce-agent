"use node";

import { action, ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { v, ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { generateTextEmbedding, generateImageDescription } from "../lib/openai";

type EmbeddingId = Id<"productEmbeddings">;
type VectorSearchResult = { _id: EmbeddingId; _score: number };
interface ProductSearchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  score: number;
}

// Constants
const RESULT_LIMIT = 10;
const SEARCH_LIMIT = 30; // Higher limit to account for price filtering

/**
 * Search products using text query with optional price filtering.
 *
 * @param textQuery - Text search query (e.g., "red sneakers")
 * @param minPrice - Optional minimum price filter (inclusive)
 * @param maxPrice - Optional maximum price filter (inclusive)
 * @returns Array of products with similarity scores, sorted by relevance (highest first)
 *
 * @example
 * await searchProductsByText({ textQuery: "wireless headphones", maxPrice: 200 })
 */
export const searchProductsByText = action({
  args: {
    textQuery: v.string(),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<ProductSearchResult>> => {
    const { textQuery, minPrice, maxPrice } = args;

    const textEmbedding = await generateTextEmbedding(textQuery);
    const searchResults = await ctx.vectorSearch("productEmbeddings", "by_text_embedding", {
      vector: textEmbedding,
      limit: SEARCH_LIMIT,
    });

    // Fetch and format products with scores
    return await fetchAndFormatProducts(ctx, searchResults, minPrice, maxPrice);
  },
});

/**
 * Search products using uploaded image with optional price filtering.
 *
 * @param imageId - Convex storage ID of uploaded image
 * @param minPrice - Optional minimum price filter (inclusive)
 * @param maxPrice - Optional maximum price filter (inclusive)
 * @returns Array of products with similarity scores, sorted by relevance (highest first)
 * @throws {ConvexError} If image not found in storage
 *
 * @example
 * await searchProductsByImage({ imageId: storageId, minPrice: 50 })
 */
export const searchProductsByImage = action({
  args: {
    imageId: v.id("_storage"),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<ProductSearchResult>> => {
    const { imageId, minPrice, maxPrice } = args;

    // Get image URL and generate description
    const imageUrl = await ctx.storage.getUrl(imageId);
    if (!imageUrl) {
      throw new ConvexError("Image not found in storage");
    }

    const imageDescription = await generateImageDescription(imageUrl);
    const imageEmbedding = await generateTextEmbedding(imageDescription);
    const searchResults = await ctx.vectorSearch("productEmbeddings", "by_image_embedding", {
      vector: imageEmbedding,
      limit: SEARCH_LIMIT,
    });

    return await fetchAndFormatProducts(ctx, searchResults, minPrice, maxPrice);
  },
});

/**
 * Fetches products from embedding IDs, formats them with scores, and applies filters.
 *
 * @param ctx - Action context
 * @param searchResults - Vector search results with embedding IDs and scores
 * @param minPrice - Optional minimum price filter
 * @param maxPrice - Optional maximum price filter
 * @returns Formatted and filtered product results
 */
async function fetchAndFormatProducts(
  ctx: ActionCtx,
  searchResults: VectorSearchResult[],
  minPrice?: number,
  maxPrice?: number
): Promise<Array<ProductSearchResult>> {
  const embeddingIds = searchResults.map((r) => r._id);

  const products = await ctx.runQuery(api.product.queries.getProductsByEmbeddingIds, {
    embeddingIds,
  });

  // Map products by embeddingId for efficient lookup
  const productMap = new Map(products.map((p) => [p.embeddingId, p]));

  // Format products with scores, filter by price, and limit
  return searchResults
    .map((result) => {
      const product = productMap.get(result._id);
      if (!product) return null;
      return {
        id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        score: result._score,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null && matchesPriceFilter(item.price, minPrice, maxPrice)
    )
    .slice(0, RESULT_LIMIT);
}

/**
 * Checks if a product price falls within the specified price range.
 *
 * @param price - Product price to check
 * @param minPrice - Optional minimum price (inclusive)
 * @param maxPrice - Optional maximum price (inclusive)
 * @returns true if price is within range, false otherwise
 */
function matchesPriceFilter(
  price: number,
  minPrice?: number,
  maxPrice?: number
): boolean {
  if (minPrice !== undefined && price < minPrice) return false;
  if (maxPrice !== undefined && price > maxPrice) return false;
  return true;
}
