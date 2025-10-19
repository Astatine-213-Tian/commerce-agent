# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered shopping assistant (similar to Amazon Rufus) providing conversational commerce through:
- Natural language product search and recommendations
- Image-based product discovery
- Voice mode integration

**Tech Stack**: Next.js 14 (App Router), Convex (backend/database), OpenAI (GPT-4 + Realtime API + Vision + Embeddings), Tailwind CSS + shadcn/ui

## Development Commands

```bash
# Start development server (uses Turbopack)
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code
bun lint

# Convex backend
npx convex dev        # Run Convex backend in dev mode
npx convex deploy     # Deploy Convex functions
npx convex dashboard  # Open Convex dashboard
npx convex -h         # See all Convex CLI commands
```

## Architecture

### Unified Agent Design
- **Single AI agent** handles all features (conversation, text search, image search, voice)
- Same system prompt and tools across text and voice modes
- Consistent personality and behavior throughout

### Separation of Concerns

**Convex Backend** (`convex/`):
- Pure data layer - no business logic
- Vector search for semantic product matching
- CRUD operations only
- Provides tools for AI to call

**AI Layer** (OpenAI Realtime API):
- All intelligence and decision-making
- Intent understanding from user queries
- Product comparison and recommendation logic
- Conversation management and context

### Image Search Flow
1. User uploads image
2. OpenAI Vision API generates text description
3. Description → text embedding
4. Vector search using same infrastructure as text queries

### Voice Mode
- ChatGPT-style dedicated voice interface
- Press button to enter voice conversation
- Exit shows full transcript in text chat
- Uses identical tools and system prompt as text mode

## Project Structure

```
app/
  layout.tsx         # Root layout with fonts
  page.tsx          # Main page (currently default Next.js template)
  globals.css       # Global styles

convex/             # Convex backend functions
  _generated/       # Auto-generated Convex types
  README.md         # Convex function examples

components/
  ui/               # shadcn/ui components (Button, Card, Input, etc.)

lib/
  utils.ts          # Utility functions (cn for className merging)
```

## Environment Variables

Required in `.env.local`:
```
CONVEX_DEPLOYMENT=        # Convex deployment ID
NEXT_PUBLIC_CONVEX_URL=   # Public Convex URL for client
```

Additional variables needed (not yet in .env.local):
- OpenAI API key for GPT-4, Realtime API, Vision, Embeddings

## Key Dependencies

- `@convex-dev/agent` - Convex agent framework
- `openai` - OpenAI API client (GPT-4, Realtime API, Vision, Embeddings)
- `convex` - Convex backend SDK
- `next` 15.5.6 with React 19
- `shadcn/ui` components (Radix UI + Tailwind)

## TypeScript Configuration

- Path alias: `@/*` maps to project root
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler (for Next.js)
- helper function should be put at the end of the file put the main function on the top