import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { asyncMap } from "convex-helpers";

// Public query to get all products with category names
export const getAllProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    const productsWithCategories = await asyncMap(products, async (product) => {
      const category = await ctx.db.get(product.categoryId);
      return {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryName: category?.name || "Unknown",
      };
    });

    return productsWithCategories;
  },
});

// Internal query to check if a product exists by categoryId and name
export const getProductByName = internalQuery({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    // Filter by name since we can't use a compound index
    const product = products.find((p) => p.name === args.name);
    return product;
  },
});


// Internal query to get multiple products by embedding IDs with category names
export const getProductsByEmbeddingIds = query({
  args: {
    embeddingIds: v.array(v.id("productEmbeddings")),
  },
  handler: async (ctx, args) => {
    const productsWithCategories = await asyncMap(args.embeddingIds, async (embeddingId) => {
      const product = await ctx.db
        .query("products")
        .withIndex("by_embeddingId", (q) => q.eq("embeddingId", embeddingId))
        .first();

      if (!product) return null;

      const category = await ctx.db.get(product.categoryId);
      return {
        ...product,
        categoryName: category?.name || "Unknown",
      };
    });

    return productsWithCategories.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});
