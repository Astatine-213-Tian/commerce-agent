# Engineering Specification: Voice Commerce Agent UI

## Overview

Implementation spec for building the voice shopping assistant UI with real-time audio streaming, message display, and product recommendations.

---

## Dependencies

### Required Packages

```bash
# Animation library
bun add framer-motion

# Toast notifications
npx shadcn@latest add sonner
```

### Existing Dependencies
- `@openai/agents` - OpenAI Realtime SDK
- `convex/react` - Convex React bindings
- `next` - Next.js 15
- `shadcn/ui` - UI components (Button, Card, Input)
- `tailwindcss` - Styling

---

## Architecture

### Component Hierarchy

```
app/
  layout.tsx (wrapped with ConvexClientProvider)
  page.tsx (renders VoiceAgent)

components/
  convex-client-provider.tsx    # Convex wrapper
  voice-agent.tsx                # Main container
  message-list.tsx               # Scrollable message area
  message-bubble.tsx             # Individual message
  product-card.tsx               # Product display
  bottom-bar.tsx                 # Dynamic bottom controls
  audio-waveform.tsx             # Waveform visualization
  microphone-selector.tsx        # Audio device dropdown
  text-input.tsx                 # Text message input

hooks/
  use-realtime-agent.ts          # (Already exists)
```

### Data Flow

```
useRealtimeAgent hook → VoiceAgent → MessageList → MessageBubble → ProductCard
                                  ↘ BottomBar → AudioWaveform
                                              → MicrophoneSelector
                                              → TextInput
```

---

## Component Specifications

### 1. ConvexClientProvider (`components/convex-client-provider.tsx`)

**Purpose**: Wrap app with Convex provider

**Implementation**:
```typescript
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

**Usage**: Wrap in `app/layout.tsx`

**Reference**: https://docs.convex.dev/quickstart/nextjs

---

### 2. ProductCard (`components/product-card.tsx`)

**Purpose**: Display product information within assistant messages

**Props**:
```typescript
interface ProductCardProps {
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
}
```

**Design**:
- Compact card layout (not clickable)
- Product image (aspect-ratio: 1/1, object-fit: cover)
- Name + brand (truncate if too long)
- Price formatted as currency
- Brief description (2-3 lines max)
- Category badge

**Styling**:
- Border with rounded corners
- Padding: 12px
- Max width: 280px
- Shadow: subtle

**Notes**:
- Multiple ProductCards can appear in a single message
- Render in grid layout when multiple products

---

### 3. MessageBubble (`components/message-bubble.tsx`)

**Purpose**: Display individual message with loading state

**Props**:
```typescript
interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isLoading?: boolean;
}
```

**Design**:
- **User messages**: Right-aligned, primary color background
- **Assistant messages**: Left-aligned, gray background
- **Loading state**: Shows "..." when `isLoading` is true
- **Product parsing**: Detect and render ProductCard components from content

**Product Detection**:
- Parse message content for product data (JSON array or structured format)
- Extract product objects and render as ProductCard grid
- Show regular text before/after products

**Styling**:
- Rounded corners (12px)
- Padding: 12px 16px
- Max width: 70% on desktop, 85% on mobile
- Font size: 14px

**Behavior**:
- Update content when transcript arrives (isLoading changes from true to false)
- Smooth transition using framer-motion

---

### 4. MessageList (`components/message-list.tsx`)

**Purpose**: Scrollable container for messages

**Props**:
```typescript
interface MessageListProps {
  messages: Message[];
  connectionState: "disconnected" | "connecting" | "connected" | "ended";
}
```

**States**:
1. **disconnected**: Show welcome screen with example prompts
2. **connecting**: Show loading spinner + status text
3. **connected**: Show scrollable messages
4. **ended**: Show "SESSION ENDED" divider + scrollable messages (read-only)

**Design**:
- Full height container with overflow-y: auto
- Auto-scroll to bottom on new messages
- Smooth scroll behavior
- Gap between messages: 16px

**Welcome Screen** (disconnected state):
- Centered content
- App icon/emoji
- Title: "Commerce Assistant"
- Subtitle: "Voice Shopping Assistant"
- Description: "Start a conversation to find products"
- Example prompts in card layout

**Loading Screen** (connecting state):
- Centered spinner
- Status messages:
  - "Connecting to assistant..."
  - "Requesting microphone access..."

**Behavior**:
- Use `useEffect` to scroll to bottom when messages change
- Scroll behavior: smooth
- Use `scrollIntoView` on last message ref

---

### 5. AudioWaveform (`components/audio-waveform.tsx`)

**Purpose**: Visualize audio levels from MediaStream

**Props**:
```typescript
interface AudioWaveformProps {
  mediaStream: MediaStream | null;
  isActive: boolean; // true when listening or speaking
}
```

**Implementation**:
1. Create AudioContext and AnalyserNode
2. Connect MediaStream to analyser
3. Use `getByteFrequencyData()` to get audio levels
4. Update bar heights in requestAnimationFrame loop
5. Use framer-motion for smooth bar animations

**Design**:
- 20-30 vertical bars
- Bar characters: `▁▂▃▄▅▆▇█`
- Animate based on audio levels (map 0-255 to bar heights)
- When inactive: show static low bars
- Display inline in bottom bar

**Styling**:
- Monospace font
- Color: muted gray when inactive, primary when active
- Height matches text line-height
- Letter-spacing: 2px

**Performance**:
- Use requestAnimationFrame for updates
- Cleanup on unmount (close AudioContext)

---

### 6. MicrophoneSelector (`components/microphone-selector.tsx`)

**Purpose**: Dropdown to select audio input device

**Props**:
```typescript
interface MicrophoneSelectorProps {
  selectedDeviceId: string | undefined;
  onDeviceChange: (deviceId: string) => void;
}
```

**Implementation**:
1. Use `navigator.mediaDevices.enumerateDevices()` to list audio inputs
2. Filter for `kind === "audioinput"`
3. Auto-select default device on mount
4. Trigger callback on selection change

**Design**:
- Use shadcn Select component
- Icon: 🎤
- Placeholder: "Default Microphone"
- Show device label in dropdown options

**Behavior**:
- Update device list when `devicechange` event fires
- Handle permission denied gracefully

---

### 7. TextInput (`components/text-input.tsx`)

**Purpose**: Text input for typing messages (alternative to voice)

**Props**:
```typescript
interface TextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}
```

**Design**:
- Input with send button (icon: 📤)
- Placeholder: "Type your message..."
- Full width within bottom bar

**Styling**:
- Use shadcn Input component
- Height: 40px
- Rounded corners

**Behavior**:
- Submit on Enter key or button click
- Clear input after send
- Disabled when not connected
- Trim whitespace before sending
- Ignore empty messages

---

### 8. BottomBar (`components/bottom-bar.tsx`)

**Purpose**: Dynamic bottom controls that change based on connection state

**Props**:
```typescript
interface BottomBarProps {
  connectionState: "disconnected" | "connecting" | "connected" | "ended";
  status: string; // "Listening...", "Speaking..."
  mediaStream: MediaStream | null;
  onStartSession: () => void;
  onEndSession: () => void;
  onCancelConnection: () => void;
  onSendText: (text: string) => void;
  selectedMicId: string | undefined;
  onMicChange: (deviceId: string) => void;
}
```

**States**:

1. **disconnected/ended**:
   - Single row
   - Left: MicrophoneSelector
   - Right: Start Session button (primary)

2. **connecting**:
   - Single row
   - Left: Loading animation (||||||||...)
   - Right: Cancel button

3. **connected**:
   - Two rows (expanded)
   - Row 1: TextInput with send button
   - Row 2: Status text + AudioWaveform + End Session button

**Design**:
- Fixed position at bottom of viewport
- Width: 100%
- Max-width: 600px (centered)
- Padding: 16px
- Background: white (light mode) / dark (dark mode)
- Border-top: 1px solid border color
- Shadow: elevated

**Transitions**:
- Use framer-motion for smooth height changes
- Animate between single row and double row
- Duration: 200ms ease-in-out

---

### 9. VoiceAgent (`components/voice-agent.tsx`)

**Purpose**: Main container that orchestrates all components

**Implementation**:
```typescript
export default function VoiceAgent() {
  const {
    status,
    isConnected,
    messages,
    mediaStream,
    connect,
    disconnect,
    sendText,
  } = useRealtimeAgent();

  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected" | "ended"
  >("disconnected");
  const [selectedMicId, setSelectedMicId] = useState<string | undefined>();

  // Handle connection state changes
  // Handle errors with toast
  // Render MessageList + BottomBar
}
```

**Layout**:
```
<div className="flex flex-col h-screen">
  <MessageList
    messages={messages}
    connectionState={connectionState}
  />
  <BottomBar
    connectionState={connectionState}
    {...otherProps}
  />
  <Toaster /> {/* from sonner */}
</div>
```

**Error Handling**:
- Use sonner toast for all errors
- Toast on connection failure
- Toast on microphone permission denied
- Toast on session errors

**State Management**:
- Map hook's `status` to `connectionState`
- Track mic selection in local state
- Manage session lifecycle (start → connecting → connected → ended)

---

## App Integration

### Update `app/layout.tsx`

Wrap children with ConvexClientProvider:

```typescript
import { ConvexClientProvider } from "@/components/convex-client-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

### Update `app/page.tsx`

Replace default content with VoiceAgent:

```typescript
import VoiceAgent from "@/components/voice-agent";

export default function Home() {
  return <VoiceAgent />;
}
```

---

## Product Data Format

Assistant messages containing products should include JSON data that can be parsed:

**Expected Format**:
```json
{
  "text": "Here are some wireless headphones I found:",
  "products": [
    {
      "name": "Sony WH-1000XM5",
      "brand": "Sony",
      "price": 299.99,
      "category": "Headphones",
      "description": "Industry-leading noise canceling...",
      "imageUrl": "https://..."
    }
  ]
}
```

**Parsing Strategy**:
1. Try to parse message content as JSON
2. If successful and contains `products` array, render ProductCards
3. Show `text` field as regular message text
4. If parsing fails, show as plain text message

---

## Styling Guidelines

### Colors
- Primary: `bg-primary text-primary-foreground` (user messages)
- Secondary: `bg-secondary text-secondary-foreground` (assistant messages)
- Muted: `text-muted-foreground` (status text)
- Success: `text-green-500` (connected indicator)
- Destructive: `bg-destructive text-destructive-foreground` (End Session)

### Spacing
- Message gap: `gap-4` (16px)
- Bottom bar padding: `p-4` (16px)
- Card padding: `p-6` (24px)
- Button height: `h-10` (40px)

### Typography
- Message text: `text-sm` (14px)
- Status text: `text-xs` (12px)
- Headings: `font-semibold`

### Responsive
- Max width: `max-w-[600px] mx-auto`
- Mobile padding: `px-4`
- Desktop padding: `px-8`

---

## Implementation Order

1. ✅ **ConvexClientProvider** - Simple wrapper
2. ✅ **ProductCard** - Standalone component
3. ✅ **MessageBubble** - Uses ProductCard
4. ✅ **MessageList** - Uses MessageBubble
5. ✅ **AudioWaveform** - Standalone with framer-motion
6. ✅ **MicrophoneSelector** - Standalone dropdown
7. ✅ **TextInput** - Simple input component
8. ✅ **BottomBar** - Composes all bottom components
9. ✅ **VoiceAgent** - Main orchestrator
10. ✅ **Update app/layout.tsx** - Add provider
11. ✅ **Update app/page.tsx** - Use VoiceAgent

---

## Testing Checklist

- [ ] Initial state shows welcome screen
- [ ] Microphone selector lists devices
- [ ] Start Session requests microphone permission
- [ ] Connecting state shows loading
- [ ] Cancel button works during connection
- [ ] Connected state shows messages and bottom bar
- [ ] Voice input creates user message with "..."
- [ ] Transcript updates replace "..."
- [ ] Assistant responses stream in
- [ ] Product cards render correctly
- [ ] Text input sends messages
- [ ] Waveform animates with audio
- [ ] End Session transitions to ended state
- [ ] Ended state shows transcript
- [ ] Start Session from ended state clears messages
- [ ] Errors show toast notifications
- [ ] Mobile layout works correctly

---

## Error Scenarios

1. **Microphone permission denied**
   - Show toast: "Microphone access denied. Please enable in browser settings."
   - Return to disconnected state

2. **Connection failed**
   - Show toast: "Failed to connect. Please try again."
   - Return to disconnected state

3. **Session error**
   - Show toast: "Session error occurred."
   - Disconnect and return to ended state

4. **No audio devices**
   - Show toast: "No microphone found."
   - Disable Start Session button

---

## Performance Considerations

1. **Audio Analysis**: Use requestAnimationFrame, not setInterval
2. **Message List**: Use React.memo for MessageBubble to prevent unnecessary re-renders
3. **Auto-scroll**: Debounce scroll updates
4. **Product Cards**: Lazy load images
5. **Cleanup**: Properly cleanup AudioContext, MediaStream, event listeners

---

## Accessibility

- All buttons have accessible labels
- Focus management for modals/dropdowns
- Keyboard navigation support
- ARIA labels for status indicators
- High contrast text
- Screen reader announcements for connection status changes

---

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
OPENAI_API_KEY=<your-openai-api-key>
```
