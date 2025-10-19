import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { asyncMap } from "convex-helpers";

// Internal query to check if a product exists by category and name
export const getProductByName = internalQuery({
  args: {
    category: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_category_name", (q) =>
        q.eq("category", args.category).eq("name", args.name)
      )
      .first();
    return product;
  },
});


// Internal query to get multiple products by embedding IDs
export const getProductsByEmbeddingIds = query({
  args: {
    embeddingIds: v.array(v.id("productEmbeddings")),
  },
  handler: async (ctx, args) => {
    const products = await asyncMap(args.embeddingIds, async (embeddingId) => {
      return await ctx.db
        .query("products")
        .withIndex("by_embeddingId", (q) => q.eq("embeddingId", embeddingId))
        .first();
    });
    return products.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});
