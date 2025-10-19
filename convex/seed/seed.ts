"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import OpenAI from "openai";
import { mockProducts } from "./products";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate DALL-E prompt from product info
function generateImagePrompt(productName: string, category: string): string {
  return `Professional product photography of ${productName}. Clean white background, studio lighting, high quality, ${category.toLowerCase()} product, square composition, centered, commercial photography style.`;
}

// Helper function to generate text embedding
async function generateTextEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Helper function to generate image description using Vision API
async function generateImageDescription(imageUrl: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this product image in detail, focusing on visual features, colors, materials, and overall appearance. Be concise but thorough.",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    max_tokens: 300,
  });
  return response.choices[0].message.content || "";
}

// Main seeding action
export const seedAllProducts = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log(`Starting to seed ${mockProducts.length} products...`);

    for (let i = 0; i < mockProducts.length; i++) {
      const product = mockProducts[i];
      console.log(`\n[${i + 1}/${mockProducts.length}] Processing: ${product.name}`);

      try {
        // Step 1: Generate product image with gpt-image-1-mini
        console.log("  - Generating image with gpt-image-1-mini...");
        const imagePrompt = generateImagePrompt(product.name, product.category);
        const imageResponse = await openai.images.generate({
          model: "gpt-image-1-mini",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "medium", // low, medium, or high
          // Note: gpt-image-1-mini returns b64_json by default (no response_format param)
        });

        if (!imageResponse.data || imageResponse.data.length === 0) {
          throw new Error("No image data returned from gpt-image-1-mini");
        }

        const b64Image = imageResponse.data[0].b64_json;
        if (!b64Image) {
          throw new Error("No base64 image data returned from gpt-image-1-mini");
        }

        // Step 2: Convert base64 to blob and store in Convex storage
        console.log("  - Storing image in Convex storage...");
        const imageBuffer = Buffer.from(b64Image, "base64");
        const imageBlob = new Blob([imageBuffer], { type: "image/png" });
        const storageId = await ctx.storage.store(imageBlob);

        // Step 3: Generate image description using Vision API
        // For Vision API, we need to convert base64 to data URL
        console.log("  - Generating image description with Vision API...");
        const dataUrl = `data:image/png;base64,${b64Image}`;
        const imageDescription = await generateImageDescription(dataUrl);

        // Step 4: Generate image embedding from description
        console.log("  - Creating image embedding...");
        const imageEmbedding = await generateTextEmbedding(imageDescription);

        // Step 5: Generate text embedding from name + description
        console.log("  - Creating text embedding...");
        const textContent = `${product.name}. ${product.description}`;
        const textEmbedding = await generateTextEmbedding(textContent);

        // Step 6: Insert product into database
        console.log("  - Inserting into database...");
        await ctx.runMutation(internal.seed.insertProduct.insertProduct, {
          name: product.name,
          brand: product.brand,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: storageId,
          textEmbedding,
          imageEmbedding,
        });

        console.log(`  ✓ Successfully seeded: ${product.name}`);
      } catch (error) {
        console.error(`  ✗ Error processing ${product.name}:`, error);
        throw error; // Stop on first error for debugging
      }
    }

    console.log(`\n✓ Successfully seeded all ${mockProducts.length} products!`);
    return { success: true, count: mockProducts.length };
  },
});
