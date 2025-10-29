---
applyTo: "logic/storage.ts,logic/provider-registry.ts,entrypoints/options/**"
---

# LLM Provider Configuration

## Storage Structure

LLM providers are stored as an array of `LLMProviderConfig` objects:

```typescript
interface LLMProviderConfig {
  id: string;         // Unique identifier (auto-generated timestamp-based)
  name: string;       // Display name for user identification
  type: ProviderType; // "openai" | "anthropic" | "google"
  apiKey: string;     // Provider API key
  baseURL?: string;   // Optional custom endpoint for OpenAI-compatible providers
  models: string[];   // List of available model names
}
```

## Provider Registry Pattern

Uses Vercel AI SDK's `experimental_createProviderRegistry`:

1. **Native providers**: OpenAI, Anthropic, Google Generative AI
2. **Custom providers**: Any OpenAI-compatible endpoint via `baseURL`
3. **Model access**: Format `{providerId}:{modelName}`

## Key Implementation Details

### Provider Registry (`logic/provider-registry.ts`)
- `createLLMProviderRegistry(providers)`: Creates registry from config array
- `parseModelString(modelString, providers)`: Converts "id:model" to language model
- Supports custom baseURL for OpenAI-compatible services

### Storage (`logic/storage.ts`)
- `llmProviders`: Array of provider configurations
- `defaultModel`: Default model string in "providerId:model" format
- `selectedModel`: Currently selected model (overrides default)

### Options Page
- Add/remove providers dynamically
- Configure: name, type, apiKey, baseURL, models
- Update default model selection
- Real-time validation (disable unconfigured models)

## Usage Pattern

```typescript
// User adds provider in Options
const newProvider = {
  id: `provider-${Date.now()}`,
  name: "OpenRouter",
  type: "openai",
  apiKey: "sk-or-v1-...",
  baseURL: "https://openrouter.ai/api/v1",
  models: ["anthropic/claude-3.5-sonnet"]
};

// Registry automatically creates provider instance
const registry = createLLMProviderRegistry([newProvider]);

// Access model
const model = registry.languageModel("provider-xxx:anthropic/claude-3.5-sonnet");
```

## Design Principles

1. **Flexibility**: Support any OpenAI-compatible provider
2. **Type Safety**: Strong typing with ProviderType enum
3. **User Control**: Full CRUD on providers via UI
4. **Separation**: Provider config separate from runtime registry
5. **Extensibility**: Easy to add new provider types

## Common Patterns

### Adding Provider
```typescript
const providers = [...llmProviders.value, newConfig];
llmProviders.value = providers;
```

### Updating Provider
```typescript
const providers = [...llmProviders.value];
providers[index] = { ...providers[index], apiKey: newKey };
llmProviders.value = providers;
```

### Removing Provider
```typescript
const providers = [...llmProviders.value];
providers.splice(index, 1);
llmProviders.value = providers;
```

## Notes

- Provider IDs are auto-generated using timestamps to ensure uniqueness
- baseURL enables OpenRouter, Together AI, Ollama, and other OpenAI-compatible services
- Model strings must follow "providerId:modelName" format
- All provider data stored locally, never sent to InKCre Core
