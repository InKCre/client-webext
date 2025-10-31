# Explain Component

A sophisticated sidepanel component that provides AI-powered explanations for selected text with streaming support, model selection, and error handling.

## Overview

The Explain component is a core feature of the InKCre extension that allows users to get detailed explanations of selected text from web pages. It integrates with multiple LLM providers, supports streaming responses, and provides a rich user experience with editable queries and action buttons.

## Usage

```vue
<template>
  <Explain @activate="handleTabActivation" />
</template>

<script setup lang="ts">
import Explain from "~/components/sidepanel/Explain/Explain.vue";

const handleTabActivation = (tab: string) => {
  console.log("Activated tab:", tab);
};
</script>
```

## Props

This component does not accept props. It manages its state through messages and global storage.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `activate` | `[tab: string]` | Emitted when the component should be activated/focused |

## Features

### Streaming Explanations

- Real-time streaming of AI responses using the `useExplainStream` composable
- Visual feedback with loading states and streaming cursor
- Ability to stop generation mid-stream

### Multi-Provider Support

- Supports multiple LLM providers (OpenAI, Anthropic, Google, etc.)
- Model selection via ProviderPicker component
- Automatic provider detection based on API key configuration
- Fallback to default model when no specific model is selected

### Editable Query

- The query text is contenteditable for user modifications
- Auto-triggers new explanation on query edit
- Supports Enter key to save and re-fetch

### Page Context Integration

- Receives selected text from content scripts via webext-bridge
- Includes page URL and full page content for context-aware explanations
- Uses Mozilla Readability for clean text extraction

### Error Handling

- Displays error messages with helpful hints
- Validates model configuration before making requests
- Provides retry functionality on failures
- Configuration hints for unconfigured providers

### Action Buttons

- **Retry**: Re-fetch explanation with current query
- **Stop**: Stop streaming generation
- **Save**: Save explanation to taking-note panel
- **Provider Info**: Displays which model was used

## State Management

### Local State

```typescript
const query = ref<string>("");              // User's query text
const pageContext = ref<{ pageUrl?: string; pageContent?: string }>({});
const explanation = ref("");                 // AI response
const isLoading = ref(false);               // Loading state
const errorMessage = ref("");               // Error display
const usedProviderInfo = ref("");          // Provider info display
```

### Global Storage

- `llmProviders` - Provider configurations
- `selectedModel` - Currently selected model
- `defaultModel` - Default model fallback

## Message Handling

### Incoming Messages

**`set-explain-params`**
```typescript
{
  text: string;           // Selected text to explain
  url: string;            // Page URL
  pageContent: string;    // Full page content
}
```

Triggered when user selects text and clicks the "Explain" action in the ActionBar.

### Outgoing Messages

**`set-sidepanel-mode`**
```typescript
{ mode: "taking-note" }
```

**`set-taking-note-params`**
```typescript
{ text: string }
```

## Methods

### `initializeStream()`

Initializes or re-initializes the streaming composable with current model configuration.

```typescript
const initializeStream = () => {
  const modelString = selectedModel.value || defaultModel.value;
  if (!modelString) return;
  
  stream = useExplainStream({
    modelString,
    providers: llmProviders.value,
    onError: (error) => {
      console.error("Streaming error:", error);
    },
  });
  
  // Sync refs and set up watchers
};
```

### `fetchExplanation()`

Fetches explanation for the current query with model validation.

```typescript
const fetchExplanation = async () => {
  // Validates model configuration
  // Calls stream.explain() with query and page context
};
```

### `retryExplanation()`

Resets the stream and re-fetches explanation.

### `stopExplanation()`

Stops the current streaming generation.

### `saveExplanation()`

Saves the explanation to the taking-note panel for further processing.

### `saveQuery(event: Event)`

Saves edited query text and triggers new explanation fetch.

### `handleModelChange()`

Re-fetches explanation when user changes model selection.

## Styling

The component uses a monospace design consistent with the InKCre aesthetic:

- Courier New font family
- Black and white color scheme
- Subtle hover and active states
- Smooth transitions on interactive elements

### Key Style Features

- **Editable Text**: Border appears on focus, light background
- **Error Messages**: Red border and text with helpful hints
- **Action Buttons**: Icon buttons with hover effects
- **Provider Info**: Small, gray text showing model used
- **Animations**: Pulse and spin animations for loading states

## Integration Flow

1. User selects text on a web page
2. User clicks "Explain" in ActionBar
3. ContentScript sends `open-sidepanel` message
4. Sidepanel receives `set-explain-params` message
5. Component activates and calls `fetchExplanation()`
6. Stream starts, explanation renders in real-time
7. User can stop, retry, or save explanation

## Dependencies

### Components

- `Response` - Markdown rendering with streaming support
- `ProviderPicker` - Model selection dropdown
- `Loading` - Loading indicator (if used)

### Composables

- `useExplainStream` - Streaming explanation logic

### Libraries

- `webext-bridge` - Cross-context messaging
- `vue` - Core Vue functionality

### Logic Modules

- `~/logic/storage` - Provider and model storage
- `~/logic/explain/types` - Type definitions

## Error States

### No Model Configured

```
请在扩展选项中配置默认模型
```

Shows when no default model is set.

### Invalid Model Format

```
模型配置格式错误，请重新配置
```

Shows when model string doesn't include provider separator.

### No API Key

```
请在扩展选项中配置至少一个 LLM 提供商的 API Key。
```

Shows when no providers have API keys configured.

## Best Practices

1. **Always validate model configuration** before making requests
2. **Handle streaming errors gracefully** with user-friendly messages
3. **Provide retry mechanisms** for failed requests
4. **Clean up resources** on component unmount
5. **Use page context wisely** to provide better explanations
6. **Sanitize user input** from editable query field

## Accessibility

- Editable title with keyboard support
- Button hover states and focus indicators
- Screen reader friendly error messages
- Semantic HTML structure

## Performance Considerations

- Lazy initialization of stream on mount
- Debounced re-fetching on model changes
- Memory cleanup on stream reset
- Efficient watcher setup with deep: true only where needed

## File Structure

- `Explain.vue` - Component template and script logic
- `Explain.scss` - Comprehensive styling with animations
- `Explain.md` - This documentation file

## Future Enhancements

Potential improvements:

- Add explanation history/caching
- Support for follow-up questions
- Export explanations to various formats
- Highlight matched terms in page context
- Voice input for queries
- Multi-language support
- Customizable streaming speed
- Token usage display
- Cost estimation per explanation

## Related Components

- `TakingNote.vue` - Receives saved explanations
- `ActionBar.vue` - Triggers explanation requests
- `Response.vue` - Renders explanation content
- `ProviderPicker.vue` - Model selection interface