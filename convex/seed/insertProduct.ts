import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Internal mutation to insert a product
export const insertProduct = internalMutation({
  args: {
    name: v.string(),
    brand: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    textEmbedding: v.array(v.float64()),
    imageEmbedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("products", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
