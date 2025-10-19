import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    brand: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(), // 1024x1024 image
    embeddingId: v.id("productEmbeddings"), // Reference to embeddings table

    createdAt: v.number(),
  })
    .index("by_category_name", ["category", "name"])
    .index("by_embeddingId", ["embeddingId"]),

  // Separate table for embeddings (best practice for large vectors)
  productEmbeddings: defineTable({
    textEmbedding: v.array(v.float64()),   // From name+description
    imageEmbedding: v.array(v.float64()),  // From image via Vision API
  })
    .vectorIndex("by_text_embedding", {
      vectorField: "textEmbedding",
      dimensions: 1536,
    })
    .vectorIndex("by_image_embedding", {
      vectorField: "imageEmbedding",
      dimensions: 1536,
    }),
});
