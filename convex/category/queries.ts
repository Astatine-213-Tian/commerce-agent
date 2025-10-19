import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";

/**
 * List all categories
 */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories;
  },
});

/**
 * Get category by name
 */
export const getCategoryByName = internalQuery({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    return category;
  },
});

/**
 * Get category by slug
 */
export const getCategoryBySlug = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return category;
  },
});

/**
 * Get category by ID
 */
export const getCategoryById = internalQuery({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    return category;
  },
});
