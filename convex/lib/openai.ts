"use node";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate text embedding
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Helper function to generate image description using Vision API
export async function generateImageDescription(imageUrl: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this product image in detail, focusing on visual features, colors, materials, and overall appearance. Be concise but thorough for search purposes.",
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

// Helper function to generate DALL-E prompt from product info
export function generateImagePrompt(productName: string, category: string): string {
  return `Professional product photography of ${productName}. Clean white background, studio lighting, high quality, ${category.toLowerCase()} product, square composition, centered, commercial photography style.`;
}
