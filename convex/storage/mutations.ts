import { mutation } from "../_generated/server";

/**
 * Generates a temporary upload URL for uploading images to Convex storage.
 * The frontend should:
 * 1. Call this mutation to get an upload URL
 * 2. POST the image file to the returned URL
 * 3. Use the returned storage ID for image search
 *
 * @returns Upload URL string that expires after a short time
 *
 * @example
 * // Frontend usage
 * const uploadUrl = await convex.mutation(api.chat.mutations.generateUploadUrl);
 * const response = await fetch(uploadUrl, {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": imageFile.type,
 *   },
 *   body: imageFile
 * });
 * const { storageId } = await response.json();
 * // Now use storageId in searchProducts
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
