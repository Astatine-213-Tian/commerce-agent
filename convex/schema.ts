import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    brand: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(), // Single square image

    // Dual embeddings for text + image search
    textEmbedding: v.array(v.float64()),   // From name+description
    imageEmbedding: v.array(v.float64()),  // From image via Vision API

    createdAt: v.number(),
  })
    .vectorIndex("by_text_embedding", {
      vectorField: "textEmbedding",
      dimensions: 1536,
      filterFields: ["category"],
    })
    .vectorIndex("by_image_embedding", {
      vectorField: "imageEmbedding",
      dimensions: 1536,
      filterFields: ["category"],
    })
    .index("by_category", ["category"]),
});
