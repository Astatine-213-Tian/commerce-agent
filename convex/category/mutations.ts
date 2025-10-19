import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Insert a new category
 */
export const insertCategory = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
    });

    return categoryId;
  },
});

/**
 * Update an existing category
 */
export const updateCategory = internalMutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;

    await ctx.db.patch(categoryId, updates);
  },
});
