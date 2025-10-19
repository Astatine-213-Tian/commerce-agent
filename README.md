# AI Commerce Agent

An intelligent, AI-powered shopping assistant that provides a conversational commerce experience similar to Amazon Rufus. The agent helps users discover products through natural language conversations, text-based recommendations, and image-based search.

## ✨ Core Features

1. **General Conversation** - Natural language chat about the agent's capabilities ("What can you help me with?")

2. **Text-Based Product Recommendation** - Intelligent product search from queries ("I need a waterproof jacket for hiking")

3. **Image-Based Product Search** - Upload an image to find similar products (Upload shoe photo → find similar styles)

## 🛠 Tech Stack

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** (App Router)
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
  - **GPT-4**: Advanced reasoning for natural conversations
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
