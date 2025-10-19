import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the URL for a file stored in Convex storage.
 *
 * @param storageId - The storage ID returned from upload
 * @returns The public URL to access the file
 */
export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get URLs for multiple files stored in Convex storage.
 *
 * @param storageIds - Array of storage IDs
 * @returns Array of public URLs (null if file doesn't exist)
 */
export const getImageUrls = query({
  args: {
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.storageIds.map(id => ctx.storage.getUrl(id))
    );
  },
});
