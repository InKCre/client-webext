# Explain Agent Architecture

## Overview

The Explain Agent is a browser-based AI agent built using Vercel AI SDK that provides intelligent explanations by combining:
- Page context from current browser tab
- User's knowledge base retrieval (InKCre Core)
- LLM-powered synthesis

## Key Design Principles

### SOLID Compliance

1. **Single Responsibility Principle**
   - `ProviderFactory`: Only handles provider instance creation
   - `ExplainAgent`: Only handles agent execution logic
   - `provider-registry`: Only handles registry creation
   - Each strategy class handles one provider type

2. **Open/Closed Principle**
   - `ProviderCreationStrategy` interface allows extension
   - New provider types can be added via `factory.registerStrategy()` without modifying existing code

3. **Liskov Substitution Principle**
   - All strategies implement `ProviderCreationStrategy` interface
   - Strategies are interchangeable

4. **Interface Segregation Principle**
   - `ProviderCreationStrategy` has minimal, focused interface
   - `AITool` is a thin wrapper over Vercel AI SDK's `CoreTool`

5. **Dependency Inversion Principle**
   - `ProviderFactory` depends on `ProviderCreationStrategy` interface, not concrete implementations
   - High-level modules don't depend on low-level modules

### Strategy Pattern

Provider creation uses Strategy Pattern:
- `ProviderCreationStrategy`: Interface defining provider creation contract
- `OpenAIProviderStrategy`, `AnthropicProviderStrategy`, etc.: Concrete implementations
- `ProviderFactory`: Context that delegates to appropriate strategy

## Architecture Components

### 1. Provider Management (`logic/provider-factory.ts`)

Handles LLM provider instantiation with strategy pattern:

```typescript
// Each provider type has dedicated strategy
class OpenAIProviderStrategy implements ProviderCreationStrategy {
  canHandle(type: ProviderType): boolean;
  create(config: LLMProviderConfig): any | null;
}

// Factory delegates to appropriate strategy
const factory = new ProviderFactory();
const provider = factory.createProvider(config);
```

### 2. Provider Registry (`logic/provider-registry.ts`)

Creates Vercel AI SDK registry from provider configurations:

```typescript
// Creates registry with all configured providers
const registry = createLLMProviderRegistry(providers);

// Parses model string and returns language model
const model = parseModelString("provider-id:model-name", providers);
```

### 3. Explain Agent (`logic/agents/explain-agent.ts`)

Executes explanation requests with knowledge base integration:

```typescript
const agent = new ExplainAgent(name, instructions, tools);
const result = await agent.execute({
  text: "explain this",
  modelString: "provider:model",
  providers: llmProviders,
  tabId: currentTabId
});
```

**Key Features**:
- Retrieves page context via webext-bridge
- Builds contextual query automatically
- Integrates with knowledge base tools
- Returns structured result with tool calls

### 4. Knowledge Base Tools (`logic/agents/tools.ts`)

Vercel AI SDK tools for knowledge retrieval:

- `knowledgeBaseRetrievalTool`: Semantic search in user's knowledge base
- `contextualRetrievalTool`: Context-aware retrieval using block ID

Both tools:
- Use Zod schemas for type safety
- Return structured results
- Handle errors gracefully

## Testing

Unit tests use Vitest:

```bash
pnpm test          # Run all tests
pnpm test:ui       # Run with UI
pnpm test:coverage # Generate coverage report
```

**Test Coverage**:
- `provider-factory.test.ts`: All strategies and factory methods
- `provider-registry.test.ts`: Registry creation and model parsing

## Usage Patterns

### Adding New Provider Type

1. Create strategy implementing `ProviderCreationStrategy`
2. Register with factory: `factory.registerStrategy(newStrategy)`
3. Update `ProviderType` enum in `storage.ts`
4. Update UI to support new type

### Executing Agent

```typescript
import { createExplainAgent } from "~/logic/agents";

// Create agent (factory function)
const agent = createExplainAgent();

// Execute with user query
const result = await agent.execute({
  text: "quantum entanglement",
  modelString: selectedModel || defaultModel,
  providers: llmProviders,
  tabId: currentTabId,
});

// Handle result
if (result.error) {
  // Show error to user
} else {
  // Display result.content
  // Optionally show result.toolCalls
}
```

### Model String Format

Format: `{providerId}:{modelName}`

Examples:
- `openai-1:gpt-4o`
- `anthropic-2:claude-3-5-sonnet-20241022`
- `openrouter-1:anthropic/claude-3.5-sonnet`

## Common Patterns

### Error Handling

```typescript
try {
  const model = parseModelString(modelString, providers);
} catch (error) {
  return { content: "", error: error.message };
}
```

### Page Context Retrieval

Agent automatically fetches page context from content script:

```typescript
// In agent.execute()
const pageContext = await this.getPageContext(tabId);
if (pageContext) {
  contextInfo += `Page content: ${pageContext.pageContent}`;
}
```

### Tool Integration

Tools are automatically available to the agent:

```typescript
const tools = [
  knowledgeBaseRetrievalTool,
  contextualRetrievalTool,
];

const agent = new ExplainAgent(name, instructions, tools);
```

## Best Practices

1. **Always validate model strings** before passing to agent
2. **Handle errors gracefully** - show user-friendly messages
3. **Limit page content** to avoid token overflow (2000 chars default)
4. **Use type-safe patterns** - leverage Zod schemas
5. **Test thoroughly** - write unit tests for new features

## Future Extension Points

1. **Additional Tools**: Add more tools to `tools.ts`
2. **Custom Providers**: Register custom strategies with factory
3. **Agent Types**: Create new agent classes for different use cases
4. **Middleware**: Add Vercel AI SDK middleware for logging, caching, etc.
