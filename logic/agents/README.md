# Agent Framework

> **Documentation**: See [Agent Development Guide](../../docs/agent-development-guide.md) | [Architecture Instructions](../../.github/instructions/explain-agent.instructions.md)

This directory contains the agent framework implementation using Vercel AI SDK with SOLID design principles.

## Files

- `explain-agent.ts`: Explain agent implementation (SRP: agent execution)
- `tools.ts`: Knowledge base retrieval tools (SRP: tool definitions)
- `types.ts`: Type definitions for agents (SRP: type contracts)
- `index.ts`: Factory functions for creating agents (Factory Pattern)

## Quick Start

### Using Explain Agent

```typescript
import { createExplainAgent } from "~/logic/agents";

const agent = createExplainAgent();
const result = await agent.execute({
  text: "Explain quantum computing",
  modelString: "openai-1:gpt-4o",
  providers: llmProviders,
  tabId: currentTabId,
});

if (result.error) {
  console.error(result.error);
} else {
  console.log(result.content);
  console.log("Used:", result.usedProvider, result.usedModel);
}
```

### Running Tests

```bash
# Run all agent tests
pnpm test logic/agents

# Run specific test file
pnpm test explain-agent.test.ts

# Watch mode
pnpm test --watch
```

## Architecture

### SOLID Principles Implementation

1. **Single Responsibility**: Each class has one reason to change
2. **Open/Closed**: Extensible via interfaces, closed for modification
3. **Liskov Substitution**: All strategies interchangeable
4. **Interface Segregation**: Minimal, focused interfaces
5. **Dependency Inversion**: Depends on interfaces, not implementations

See [Architecture Instructions](../../.github/instructions/explain-agent.instructions.md) for details.

### Design Patterns

- **Strategy Pattern**: Provider creation
- **Factory Pattern**: Agent creation
- **Dependency Injection**: Tools and strategies

## Knowledge Base Tools

### `knowledgeBaseRetrievalTool`
Semantic search in user's knowledge base.

### `contextualRetrievalTool`
Context-aware retrieval using block ID.

## Testing

```bash
pnpm test                # Run all tests
pnpm test:coverage       # Coverage report
pnpm test:ui             # Interactive UI
```

See [Agent Development Guide](../../docs/agent-development-guide.md) for detailed testing patterns and examples.

## Resources

- [Agent Development Guide](../../docs/agent-development-guide.md) - Task-oriented guide
- [Architecture Instructions](../../.github/instructions/explain-agent.instructions.md) - Detailed architecture
- [Vercel AI SDK Docs](https://ai-sdk.dev) - Official SDK documentation
