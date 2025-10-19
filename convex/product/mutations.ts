import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Internal mutation to insert a product
export const insertProduct = internalMutation({
  args: {
    name: v.string(),
    brand: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("categories"),
    imageUrl: v.string(),
    textEmbedding: v.array(v.float64()),
    imageEmbedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    // First, create the embedding entry in separate table
    const embeddingId = await ctx.db.insert("productEmbeddings", {
      textEmbedding: args.textEmbedding,
      imageEmbedding: args.imageEmbedding,
      categoryId: args.categoryId,
    });

    // Then, insert the product with reference to embedding
    await ctx.db.insert("products", {
      name: args.name,
      brand: args.brand,
      description: args.description,
      price: args.price,
      categoryId: args.categoryId,
      imageUrl: args.imageUrl,
      embeddingId,
      createdAt: Date.now(),
    });
  },
});
