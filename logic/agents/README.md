# InKCre Agents

This directory contains the AI agent implementation for InKCre WebExt, built using Vercel AI SDK (the same foundation that VoltAgent uses).

## Architecture

The agent system uses Vercel AI SDK's core functions in a browser-compatible way:

- **Types** (`types.ts`): Core type definitions for agent results and tool calls
- **Tools** (`tools.ts`): AI SDK tools for knowledge base retrieval
- **ExplainAgent** (`explain-agent.ts`): Agent class using AI SDK's `generateText`
- **Agent Factory** (`index.ts`): Factory function to create configured agents

## Why Vercel AI SDK?

Vercel AI SDK (what VoltAgent is built on) provides:
- Browser-compatible AI agent capabilities
- Type-safe tool system using Zod schemas
- Built-in LLM provider integration (OpenAI, Anthropic, etc.)
- Automatic tool execution and orchestration
- Multi-step reasoning with `maxSteps`

Note: VoltAgent itself has Node.js-specific dependencies and cannot run in browser extensions. This implementation uses the same AI SDK that powers VoltAgent, providing equivalent functionality in a browser-compatible package.

## Why Local Agents?

InKCre WebExt is a wrapper around InKCre Core (an information repository). Content generation and AI-assisted features should be implemented in the client (browser extension) rather than in the backend API. This approach:

1. **Separates Concerns**: InKCre Core focuses on data storage and retrieval
2. **Flexibility**: Users can choose their LLM provider (OpenAI, Anthropic, etc.)
3. **Privacy**: User API keys stay on their device
4. **Extensibility**: Easy to add new agents and tools without backend changes

## Explain Agent

The Explain Agent uses Vercel AI SDK to combine:
- **Page Context**: Current page URL and content
- **Knowledge Base**: Semantic search through user's stored blocks via AI SDK tools
- **LLM Capabilities**: OpenAI GPT models (via @ai-sdk/openai)

### Tools

1. **Knowledge Base Retrieval** (`retrieve_from_knowledge_base`): 
   - Searches user's knowledge base using semantic similarity
   - Returns relevant blocks based on query
   - Built with AI SDK's `tool` function

2. **Contextual Retrieval** (`retrieve_with_context`):
   - Retrieves information related to a specific block/page
   - Useful for finding related notes and concepts
   - Built with AI SDK's `tool` function

## Usage

```typescript
import { createExplainAgent } from "~/logic/agents";
import { openaiApiKey } from "~/logic/storage";

// Create agent instance
const agent = createExplainAgent(openaiApiKey.value);

// Execute with context
const result = await agent.execute({
  query: "Explain: quantum computing",
  pageContent: "...",
  pageUrl: "https://example.com",
  contextBlockId: 123,
});

console.log(result.content); // Explanation in Markdown
```

## Configuration

Users must configure their OpenAI API key in the extension options page. The key is stored locally using the extension's storage API.

## Dependencies

- `ai`: Vercel AI SDK - the core AI agent framework (browser-compatible)
- `@ai-sdk/openai`: OpenAI provider for Vercel AI SDK
- `zod`: Schema validation for tool parameters

## Future Enhancements

- Add web search capability
- Support for other LLM providers (Anthropic, Google, etc.) via AI SDK providers
- Implement other specialized agents (WritingAgent, SummarizeAgent, etc.)
- Add conversation memory using AI SDK's message history
- Implement streaming responses for real-time feedback
