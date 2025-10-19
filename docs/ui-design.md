# Voice Commerce Agent UI Design

## Overview

AI-powered voice shopping assistant with support for both voice and text input. The UI adapts based on connection state, providing a clean and intuitive experience.

## Design Principles

- **Progressive disclosure**: Show controls only when relevant
- **Dual input modes**: Support both voice (WebRTC) and text input
- **Clear state indication**: Users always know what's happening
- **Minimal friction**: Easy to start, easy to use, easy to end

---

## State Transitions

```
Initial → Connecting → Active ⇄ Speaking/Listening → Session Ended → Initial
                ↓
              Cancel → Initial
```

---

## State 1: Initial (Disconnected)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  Commerce Assistant                     │
│                                                         │
│         🛍️  Voice Shopping Assistant                    │
│                                                         │
│         Start a conversation to find products          │
│                                                         │
│    ┌──────────────────────────────────────────┐       │
│    │  "Show me wireless headphones"           │       │
│    │  "Find red sneakers under $50"           │       │
│    │  "I need a laptop for gaming"            │       │
│    └──────────────────────────────────────────┘       │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [🎤 Default Microphone ▼]    [ ● Start Session ]      │
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Main Card**: Welcome message, branding, example prompts
- **Bottom Bar** (floating at bottom of screen):
  - Microphone selector dropdown (left)
  - Start Session button (right, primary style)
- **NO text input box** (only appears after connection)

### Behavior

- User selects microphone from dropdown (optional)
- Clicking "Start Session" requests microphone permission and begins connection
- Example prompts are clickable to show what's possible

---

## State 2: Connecting

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                         │
│                     ⏳ Loading...                       │
│                                                         │
│              Connecting to assistant...                │
│                                                         │
│           Requesting microphone access...              │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ||||||||||||||||||||||||||||  [✕ Cancel]              │
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Loading State**: Spinner + status messages
- **Bottom Bar** (floating at bottom of screen):
  - Loading animation (waveform style) + Cancel button (single row)

### Behavior

- Shows progress messages:
  - "Connecting to assistant..."
  - "Requesting microphone access..."
- Cancel button disconnects and returns to Initial state
- Auto-transitions to Active state on success
- Shows error message if connection fails

---

## State 3: Active Conversation

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                             🟢 Connected│
│  ┌────────────────────────────────┐                    │
│  │ USER                           │                    │
│  │ Hello?                         │                    │
│  └────────────────────────────────┘                    │
│                                                         │
│          ┌──────────────────────────────────────────┐  │
│          │ ASSISTANT                                │  │
│          │ Hey! How's it going? You sound pretty    │  │
│          │ upbeat—what's on your mind today?        │  │
│          └──────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────────────────────────┐                    │
│  │ USER                           │                    │
│  │ I'm looking for headphones     │                    │
│  └────────────────────────────────┘                    │
│                                                         │
│          ┌──────────────────────────────────────────┐  │
│          │ ASSISTANT                                │  │
│          │ Great! Let me search for some wireless   │  │
│          │ headphones for you...                    │  │
│          └──────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────┐  │
│  │ Type your message...                        [📤] │  │
│  └──────────────────────────────────────────────────┘  │
│  🎤 Listening... ▁▃▅▇█▇▅▃▁ ▁▃▅▇█▇▅▃▁      [✕ End Session]│
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Header**: Connection status indicator (🟢 Connected)
- **Message Area** (scrollable):
  - User messages (right-aligned, blue/primary color)
  - Assistant messages (left-aligned, gray)
  - Auto-scrolls to latest message
- **Bottom Bar** (floating at bottom of screen, expanded when connected):
  - **Top row**: Text input box with send button
  - **Bottom row**: Status text + Animated waveform ("🎤 Listening... ▁▃▅▇█▇▅▃▁") + End Session button

### Message Types

**User Message:**
```
┌────────────────────────────────┐
│ USER                           │
│ Show me wireless headphones    │
└────────────────────────────────┘
```

**Assistant Response:**
```
┌──────────────────────────────────────────┐
│ ASSISTANT                                │
│ I found some great options for you.      │
│ Here are wireless headphones under $100: │
└──────────────────────────────────────────┘
```

**User Message Loading (Waiting for Transcription):**
```
┌────────────────────────────────┐
│ USER                           │
│ ...                            │
└────────────────────────────────┘
```

**Example Flow:**
```
User speaks → User bubble appears with "..." →
Assistant starts speaking → Assistant transcript streams in →
User transcript arrives → "..." replaced with actual text
```

### Status Indicators

- **🎤 Listening...**: Microphone active in bottom bar
- **🔊 Speaking...**: Assistant generating audio response in bottom bar
- **Loading transcript**: User message shows "..." while waiting for Whisper transcription
  - User finishes speaking
  - User message bubble appears with "..."
  - Assistant may start responding while user transcript is still loading
  - Once transcript arrives, "..." is replaced with actual text

### Waveform Visualization

- Real-time audio level bars: `▁▃▅▇█▇▅▃▁`
- Animates based on actual microphone input levels
- Different visual intensity for listening vs speaking
- Smooth transitions between states

### Behavior

- Voice input captured automatically when connected
- When user finishes speaking:
  - User message bubble appears immediately with "..." (loading)
  - Assistant may start responding while user transcript loads
  - Once Whisper transcription completes, "..." is replaced with actual text
- Bottom bar expands to show text input above status/waveform row
- Text input sends messages on Enter or click (no loading state needed)
- Waveform visualizes audio levels from `mediaStream`
- Assistant responses stream in character by character
- Auto-scrolls to show latest messages
- End Session button disconnects and transitions to Session Ended state

---

## State 4: Session Ended

### Layout

```
┌─────────────────────────────────────────────────────────┐
│               SESSION ENDED                             │
│  ───────────────────────────────────────────────────────│
│                                                         │
│  ┌────────────────────────────────┐                    │
│  │ USER                           │                    │
│  │ Hello?                         │                    │
│  └────────────────────────────────┘                    │
│                                                         │
│          ┌──────────────────────────────────────────┐  │
│          │ ASSISTANT                                │  │
│          │ Hey! How's it going? You sound pretty    │  │
│          │ upbeat—what's on your mind today?        │  │
│          └──────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────────────────────────┐                    │
│  │ USER                           │                    │
│  │ I'm looking for headphones     │                    │
│  └────────────────────────────────┘                    │
│                                                         │
│          ┌──────────────────────────────────────────┐  │
│          │ ASSISTANT                                │  │
│          │ Great! Let me search for headphones...   │  │
│          └──────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [🎤 Default Microphone ▼]    [ ● Start Session ]      │
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Session Divider**: "SESSION ENDED" banner
- **Message Area**: Full transcript (read-only, scrollable)
- **Bottom Bar** (floating at bottom of screen):
  - Microphone selector dropdown (left)
  - Start Session button (right, primary style)
  - **Same as Initial state** - allows starting a new session

### Behavior

- Shows complete conversation history
- Messages are read-only (no input box active)
- User can select different microphone before starting new session
- Clicking "Start Session" clears old messages and begins new connection
- Transcript can be scrolled/reviewed

---

## Component Breakdown

### Layout Structure

- **Main Card**: Centered content area (messages, welcome screen, etc.)
- **Bottom Bar**: Fixed/floating bar at bottom of viewport, separate from main card
- Spacing between main card and bottom bar to show separation

### Components to Implement

1. **`VoiceAgent`** - Main container component
   - Manages all state transitions
   - Uses `useRealtimeAgent` hook
   - Renders appropriate UI for current state

2. **`AudioWaveform`** - Waveform visualization
   - Takes `mediaStream` as prop
   - Uses Web Audio API (AnalyserNode)
   - Animates bars based on audio levels
   - Displays inline with status text in bottom bar
   - Shows static bars when no audio

3. **`MessageBubble`** - Individual message display
   - Props: `role`, `content`, `isLoading`
   - Different styles for user vs assistant (right-aligned vs left-aligned)
   - Shows "..." when `isLoading` is true (waiting for transcript)
   - Updates content when transcript arrives

4. **`MessageList`** - Scrollable message container
   - Auto-scrolls to bottom on new messages
   - Smooth scroll behavior
   - Empty state when no messages

5. **`BottomBar`** - Dynamic bottom controls
   - Changes based on connection state
   - **Initial**: Single row with Mic selector + Start button
   - **Connecting**: Single row with Loading animation + Cancel button
   - **Active**: Expands to two rows:
     - Row 1: Text input box with send button
     - Row 2: Status/Waveform + End Session button
   - **Ended**: Single row with Mic selector + Start button (same as Initial)

---

## Styling Guidelines

### Colors

- **Primary**: Blue (#3b82f6) for user messages, primary buttons
- **Secondary**: Gray (#6b7280) for assistant messages
- **Success**: Green (#10b981) for connected status
- **Destructive**: Red (#ef4444) for End Session button
- **Muted**: Gray (#9ca3af) for status text

### Typography

- **Headings**: Geist Sans, semibold
- **Body**: Geist Sans, regular
- **Monospace**: Geist Mono (if needed for code/technical content)
- **Message text**: 14px (sm)
- **Status text**: 13px (xs)

### Spacing

- Message bubbles: 16px vertical gap
- Bottom bar padding: 16px
- Card padding: 24px
- Button heights: 40px (default)

### Animations

- Waveform: 60fps smooth animation
- Message appearance: Fade in + slide up
- State transitions: 200ms ease-in-out
- Button hover: 150ms

---

## Responsive Design

### Desktop (≥768px)

- Max width: 600px centered
- Full feature set
- Side-by-side controls in bottom bar

### Mobile (<768px)

- Full width with 16px padding
- Stacked controls in bottom bar
- Reduced font sizes
- Smaller waveform bars

---

## Accessibility

- **Keyboard Navigation**: All controls accessible via keyboard
- **Screen Readers**: Proper ARIA labels for all interactive elements
- **Focus Indicators**: Clear focus rings on all buttons/inputs
- **Color Contrast**: WCAG AA compliant
- **Status Announcements**: Live regions for connection status changes

---

## Technical Notes

### WebRTC Integration

- Microphone access requested on "Start Session"
- MediaStream exposed from `useRealtimeAgent` hook
- Waveform component uses `AnalyserNode` for visualization
- Audio playback handled automatically by SDK

### State Management

```typescript
type ConnectionState = "disconnected" | "connecting" | "connected" | "ended";

interface VoiceAgentState {
  status: ConnectionState;
  messages: Message[];
  mediaStream: MediaStream | null;
  isConnected: boolean;
}
```

### Message Types

```typescript
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isLoading?: boolean; // true when waiting for transcript
}
```

---

## Future Enhancements

- Product cards displayed inline with messages
- Image upload for visual search
- Session export/share functionality
- Voice interruption detection
- Background noise suppression controls
- Multi-language support
