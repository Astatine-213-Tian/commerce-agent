# AI Commerce Agent

An intelligent, AI-powered shopping assistant that provides a conversational commerce experience similar to Amazon Rufus. The agent helps users discover products through natural language conversations, text-based recommendations, and image-based search.

## ✨ Core Features

1. **General Conversation** - Natural language chat about the agent's capabilities ("What can you help me with?")

2. **Text-Based Product Recommendation** - Intelligent product search from queries ("I need a waterproof jacket for hiking")

3. **Image-Based Product Search** - Upload an image to find similar products (Upload shoe photo → find similar styles)

## 🚀 Setup Instructions

### Prerequisites
- [Bun](https://bun.sh/) installed
- [OpenAI API Key](https://platform.openai.com/api-keys)

### Steps

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Create a Convex project**
   ```bash
   bunx convex dev
   ```
   This will guide you through creating a new Convex project and output your deployment credentials.

3. **Configure environment variables**

   Copy `.env.template` to `.env.local`:
   ```bash
   cp .env.template .env.local
   ```

4. **Add OpenAI API Key**

   - Add to Convex (for backend functions):
     ```bash
     bunx convex env set OPENAI_API_KEY your_openai_api_key_here
     ```

   - Add to `.env.local` (for frontend):
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

5. **Add Convex credentials to `.env.local`**

   Follow the instructions from `bunx convex dev` to add:
   ```
   CONVEX_DEPLOYMENT=your_deployment_id
   NEXT_PUBLIC_CONVEX_URL=https://your_deployment_url.convex.cloud
   ```

6. **Run the development servers**

   Keep `bunx convex dev` running in one terminal, then in another terminal:
   ```bash
   bun dev
   ```

7. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

### **Frontend**
- **[Next.js 15](https://nextjs.org/)** (App Router)
  - Server-side rendering for optimal performance
  - Built-in API routes for backend integration
  - Excellent developer experience with hot reload
  - SEO-friendly for commerce applications

- **[Tailwind CSS](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)**
  - Rapid UI development with utility classes
  - Beautiful, accessible component library
  - Consistent design system out of the box
  - Fully customizable and production-ready components

### **Backend & Database**
- **[Convex](https://convex.dev/)**
  - **Vector Search**: Built-in vector indexing for semantic product search
  - **Real-time Sync**: Live updates without polling
  - **Type Safety**: End-to-end TypeScript with auto-generated types
  - **Simple Setup**: No separate database or backend deployment needed
  - **React Hooks**: First-class React integration with `useQuery` and `useMutation`
  - **Serverless**: Automatic scaling with no infrastructure management

### **AI/ML**
- **[OpenAI API](https://openai.com/api/)**
  - **Realtime API**: Real-time streaming responses for both text and voice modes
  - **Function Calling**: Structured tool use for product searches
  - **Vision API**: Image analysis and understanding
  - **Embeddings API**: Semantic search capabilities
  - **Voice Support**: Native voice conversations through Realtime API

## 🏗 Architecture Decisions

### **Unified Agent Design**
- Single AI agent handles all three features rather than separate specialized agents
- Consistent personality and behavior across all interaction modes
- Shared system prompt ensures uniform experience

### **Separation of Concerns**
- **Commerce Backend**: Simple data retrieval layer (Convex)
  - Vector search for products
  - Basic CRUD operations
  - No business logic
- **AI Layer**: All intelligence and decision-making (OpenAI Realtime API)
  - Intent understanding
  - Product comparison logic
  - Recommendation algorithms
  - Conversation management

### **Tool Design Philosophy**
- Backend provides only data retrieval tools
- AI handles all reasoning, comparisons, and recommendations

### **Image Search Strategy**
- User uploads image → OpenAI Vision API for description
- Generate text embedding from description
- Use same vector search infrastructure as text queries
- Unified search experience regardless of input type

### **Voice Mode Architecture**
- ChatGPT-like experience with dedicated voice mode
- Press button to enter voice conversation
- Exit to see full transcript in chat
- Uses OpenAI Realtime API with same tools and system prompt as text mode

## 🤖 Agent API

The AI agent has access to three tools for product discovery. See [`lib/agent-config.ts`](./lib/agent-config.ts) for the complete implementation.

### **1. searchProductsByText**

Search for products using natural language text queries.

**Parameters:**
- `textQuery` (string, required) - Search query (e.g., "wireless headphones", "red sneakers")
- `minPrice` (number, optional) - Minimum price filter in dollars (inclusive)
- `maxPrice` (number, optional) - Maximum price filter in dollars (inclusive)

**Returns:**
Array of up to 10 products ranked by relevance, each containing:
- `name` - Product name
- `brand` - Brand name
- `price` - Price in dollars
- `category` - Product category
- `description` - Product description
- `imageUrl` - Product image URL
- `score` - Similarity score (0.3+ for text search)

**Example:**
```typescript
searchProductsByText({
  textQuery: "wireless headphones",
  maxPrice: 200
})
```

### **2. searchProductsByImage**

Search for products similar to an uploaded image.

**Parameters:**
- `imageUrl` (string, required) - URL of the uploaded image
- `minPrice` (number, optional) - Minimum price filter in dollars (inclusive)
- `maxPrice` (number, optional) - Maximum price filter in dollars (inclusive)

**Returns:**
Array of up to 10 similar products, with the same structure as text search.
- Similarity threshold: 0.5+ (stricter than text search)

**Example:**
```typescript
searchProductsByImage({
  imageUrl: "https://example.convex.cloud/image.jpg",
  minPrice: 50
})
```

### **3. listCategories**

List all available product categories.

**Parameters:**
None

**Returns:**
Array of category objects:
- `name` - Category name
- `slug` - URL-friendly slug
- `description` - Category description

**Example:**
```typescript
listCategories()
// Returns: [
//   { name: "Electronics", slug: "electronics", description: "..." },
//   { name: "Clothing", slug: "clothing", description: "..." },
//   ...
// ]
```
