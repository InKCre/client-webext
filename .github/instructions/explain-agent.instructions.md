---
applyTo: "logic/explain/**"
---

# Explain Agent Architecture

The Explain Agent is a browser-based AI agent using Vercel AI SDK. It provides intelligent explanations by combining page context from the current tab, user's knowledge base retrieval (InKCre Core), and LLM-powered synthesis.

## Key Design Principles

### Strategy Pattern

Used for provider creation:
- `ProviderCreationStrategy`: Interface for creation logic.
- Concrete strategies for each provider (e.g., OpenAI, Anthropic).
- `ProviderFactory`: Delegates to strategies.

## Architecture Components

### 1. Provider Management (`logic/provider-factory.ts`)

Instantiates LLM providers using strategies.

### 2. Provider Registry (`logic/provider-registry.ts`)

Creates Vercel AI SDK registry from configurations and parses model strings.

### 3. Explain Agent (`logic/agents/explain-agent.ts`)

Executes requests, retrieves page context, integrates knowledge base tools.

### 4. Knowledge Base Tools (`logic/agents/tools.ts`)

Tools for retrieval: `knowledgeBaseRetrievalTool` and `contextualRetrievalTool`, using Zod for type safety.

## Testing

Uses Vitest for unit tests covering factory and registry.

## Usage Patterns

### Adding New Provider

1. Implement `ProviderCreationStrategy`.
2. Register with factory.
3. Update `ProviderType` enum and UI.

### Executing Agent

```typescript
const agent = createExplainAgent();
const result = await agent.execute({
  text: "query",
  modelString: "provider:model",
  providers: llmProviders,
  tabId: currentTabId
});
```

### Model String Format

`{providerId}:{modelName}` (e.g., `openai-1:gpt-4o`).

## Common Patterns

- **Error Handling**: Validate inputs and show user-friendly errors.
- **Page Context**: Auto-fetched from content script, limited to 2000 chars.
- **Tool Integration**: Tools added automatically to agent.

## Best Practices

1. Validate model strings.
2. Handle errors gracefully.
3. Limit content to avoid token overflow.
4. Use type-safe patterns.
5. Write unit tests.

## Future Extensions

- Add more tools.
- Register custom providers.
- Create new agent types.
- Add middleware.
