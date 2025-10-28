# InKCre Agents

This directory contains the local AI agent implementation for InKCre WebExt, inspired by the [VoltAgent](https://voltagent.dev) framework.

## Architecture

The agent system follows VoltAgent's patterns but is adapted for the browser extension context:

- **Types** (`types.ts`): Core type definitions for agents, tools, and results
- **Tools** (`tools.ts`): Reusable tool implementations for knowledge base retrieval
- **ExplainAgent** (`explain-agent.ts`): Main agent class that uses OpenAI for LLM capabilities
- **Agent Factory** (`index.ts`): Factory functions to create configured agents

## Why Local Agents?

InKCre WebExt is a wrapper around InKCre Core (an information repository). Content generation and AI-assisted features should be implemented in the client (browser extension) rather than in the backend API. This approach:

1. **Separates Concerns**: InKCre Core focuses on data storage and retrieval
2. **Flexibility**: Users can choose their LLM provider (OpenAI, Anthropic, etc.)
3. **Privacy**: User API keys stay on their device
4. **Extensibility**: Easy to add new agents and tools without backend changes

## Explain Agent

The Explain Agent combines:
- **Page Context**: Current page URL and content
- **Knowledge Base**: Semantic search through user's stored blocks
- **LLM Capabilities**: OpenAI GPT models for natural language understanding

### Tools

1. **Knowledge Base Retrieval** (`retrieve_from_knowledge_base`): 
   - Searches user's knowledge base using semantic similarity
   - Returns relevant blocks based on query

2. **Contextual Retrieval** (`retrieve_with_context`):
   - Retrieves information related to a specific block/page
   - Useful for finding related notes and concepts

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

## Future Enhancements

- Add web search capability
- Support for other LLM providers (Anthropic, Google, etc.)
- Implement other specialized agents (WritingAgent, SummarizeAgent, etc.)
- Add agent memory for conversation history
- Implement multi-agent workflows
