---
applyTo: "**"
---

## General Guidelines

- Declaring properties in constructor.
- Do not modify existing data models to satisfy your needs.
- Backend base URL is in the storage.
- Follow SOLID principles for all new code.
- Write unit tests for new features using Vitest.

## Architecture Documentation Index

### By Domain

- **LLM Providers** → `llm-providers.instructions.md`
  - Provider configuration and storage
  - Model string format
  - OpenAI-compatible providers

- **Explain Agent** → `explain-agent.instructions.md`
  - Agent architecture and SOLID design
  - Provider factory and strategy pattern
  - Knowledge base tools integration
  - Testing patterns

- **UI Components** → `vue.instructions.md`
  - Vue 3 composition API patterns
  - Component naming conventions
  - Asset management

- **Styling** → `style.instructions.md`
  - Monochrome minimalism design philosophy
  - Color scheme and visual identity

- **TypeScript** → `ts.instructions.md`
  - Code conventions
  - Parameter patterns

- **Content Scripts** → `content-script.instructions.md`
  - Browser extension context
  - Page interaction patterns

## Key Concepts

### Provider System

Multi-provider LLM support with dynamic configuration:
- User adds/removes providers via Options page
- Each provider has unique ID (timestamp-based)
- Model access via `{providerId}:{modelName}` format
- OpenAI-compatible provider type for custom endpoints

### Agent Framework

Browser-compatible AI agents using Vercel AI SDK:
- Strategy pattern for provider creation
- Type-safe tools with Zod schemas
- Multi-step reasoning with `generateText`
- Knowledge base integration via tools

### Testing

Unit tests with Vitest:
- Run: `pnpm test`
- Coverage: `pnpm test:coverage`
- UI: `pnpm test:ui`

## Quick Reference

### Adding New Provider Type

1. Create `ProviderCreationStrategy` implementation
2. Register with `ProviderFactory`
3. Update `ProviderType` enum
4. Update Options UI
5. Write tests

### Creating New Agent

1. Extend `ExplainAgent` or create new class
2. Define tools with Zod schemas
3. Implement `execute()` method
4. Add factory function to `index.ts`
5. Write tests

### Adding New Tool

1. Create tool with `tool()` from Vercel AI SDK
2. Define Zod schema for parameters
3. Implement `execute()` function
4. Export from `tools.ts`
5. Add to agent's tool list

## Development Workflow

1. Make changes following SOLID principles
2. Write unit tests for new features
3. Run tests: `pnpm test`
4. Check types: `pnpm typecheck`
5. Build: `pnpm build`
