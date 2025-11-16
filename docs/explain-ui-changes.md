# Explain Sidepanel UI Changes

## Before (Single-turn)
```
┌─────────────────────────────────────┐
│ 解释 [editable query]               │
│ [Model Picker ▼]                    │
├─────────────────────────────────────┤
│                                     │
│ [Single Response from AI]           │
│ - Loading indicator                 │
│ - Markdown content                  │
│                                     │
│ [Provider] [Stop] [Retry] [保存]    │
└─────────────────────────────────────┘
```

## After (Multi-turn with Follow-up)
```
┌─────────────────────────────────────┐
│ 解释 [editable query]               │
│ [Model Picker ▼]                    │
├─────────────────────────────────────┤
│ Conversation History:               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 问题                             │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [User Question 1]           │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 回答                             │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [AI Answer 1]               │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 问题                             │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [User Follow-up Question]   │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 回答                             │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [AI Answer 2] [Streaming...] │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Provider] [Stop] [Retry] [保存对话] │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 继续追问...                      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                           [Send 📤] │
└─────────────────────────────────────┘
```

## Key UI Changes

1. **Conversation Display**
   - Shows all messages in chronological order
   - Each message has a role label (问题 for user, 回答 for assistant)
   - Messages are visually distinct with different background colors
   - User messages: `--color-surface-2`
   - Assistant messages: `--color-surface`

2. **Follow-up Input**
   - Multi-line textarea for entering follow-up questions
   - Send button with icon (📤)
   - Only shown after initial conversation starts
   - Keyboard shortcut: Enter to send, Shift+Enter for new line
   - Disabled during loading state

3. **Action Buttons**
   - Updated "保存" to "保存对话" (Save Conversation)
   - Now saves entire conversation instead of single response
   - Stop, Retry, and Save buttons remain in same position

4. **Design Consistency**
   - Follows monochrome minimalism design
   - Uses existing color variables
   - Maintains border and spacing patterns
   - Simple, functional layout without decoration

## Interaction Flow

1. User enters initial question → Auto-triggers explanation
2. AI streams response → Shows in conversation
3. User enters follow-up in textarea → Clicks send or presses Enter
4. AI responds with context of previous messages
5. Repeat steps 3-4 as needed
6. Click "保存对话" to save entire conversation to notes
