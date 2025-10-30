# Agent Development Guide

This guide helps future AI agents and developers work with the Explain Agent system efficiently.

## Quick Start

### Running Tests

```bash
pnpm test          # Run all tests
pnpm test:ui       # Interactive UI
pnpm test:coverage # Generate coverage report
```

### Project Structure

```
logic/
├── agents/
│   ├── explain-agent.ts    # Main agent implementation
│   ├── tools.ts            # Knowledge base retrieval tools
│   ├── types.ts            # Type definitions
│   └── index.ts            # Factory functions
├── provider-factory.ts     # Strategy pattern for providers
├── provider-registry.ts    # Vercel AI SDK registry
└── storage.ts              # Provider configuration types
```

## Common Tasks

### Task 1: Add New LLM Provider Type

**Example**: Adding support for Cohere

1. **Add to type enum** (`logic/storage.ts`):
```typescript
export type ProviderType = 
  | "openai" 
  | "anthropic" 
  | "google" 
  | "openai-compatible"
  | "cohere";  // Add new type
```

2. **Create strategy** (`logic/provider-factory.ts`):
```typescript
import { createCohere } from "@ai-sdk/cohere";

export class CohereProviderStrategy implements ProviderCreationStrategy {
  canHandle(type: ProviderType): boolean {
    return type === "cohere";
  }

  create(config: LLMProviderConfig): any | null {
    if (!config.apiKey) return null;
    return createCohere({ apiKey: config.apiKey });
  }
}
```

3. **Register strategy** (in `ProviderFactory` constructor):
```typescript
this.strategies = strategies || [
  new OpenAIProviderStrategy(),
  new AnthropicProviderStrategy(),
  new GoogleProviderStrategy(),
  new OpenAICompatibleProviderStrategy(),
  new CohereProviderStrategy(),  // Add here
];
```

4. **Update Options UI** (`entrypoints/options/Options.vue`):
```vue
<option value="cohere">Cohere</option>
```

5. **Write tests** (`logic/provider-factory.test.ts`):
```typescript
describe('CohereProviderStrategy', () => {
  it('should handle cohere type', () => {
    const strategy = new CohereProviderStrategy();
    expect(strategy.canHandle('cohere')).toBe(true);
  });
  
  // Add more tests...
});
```

6. **Run tests**: `pnpm test`

### Task 2: Add New Tool to Agent

**Example**: Adding web search tool

1. **Define tool** (`logic/agents/tools.ts`):
```typescript
export const webSearchTool = tool({
  description: "Search the web for current information",
  parameters: z.object({
    query: z.string().describe("Search query"),
    numResults: z.number().optional().describe("Number of results (default: 5)"),
  }),
  execute: async ({ query, numResults = 5 }) => {
    try {
      // Implement web search logic
      const results = await searchWeb(query, numResults);
      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: `Search failed: ${error}`,
      };
    }
  },
});
```

2. **Add to agent** (`logic/agents/index.ts`):
```typescript
import { webSearchTool } from "./tools";

export function createExplainAgent() {
  return new ExplainAgent(
    "Explain Agent",
    "You are a helpful assistant...",
    [
      knowledgeBaseRetrievalTool,
      contextualRetrievalTool,
      webSearchTool,  // Add here
    ]
  );
}
```

3. **Write tests** (`logic/agents/tools.test.ts`):
```typescript
describe('webSearchTool', () => {
  it('should search web successfully', async () => {
    const result = await webSearchTool.execute({
      query: "test query",
      numResults: 3,
    });
    expect(result.success).toBe(true);
  });
});
```

### Task 3: Create New Agent Type

**Example**: Creating a WritingAgent

1. **Create agent class** (`logic/agents/writing-agent.ts`):
```typescript
export class WritingAgent {
  constructor(
    private instructions: string,
    private tools: AITool[]
  ) {}

  async execute(params: {
    text: string;
    task: "improve" | "simplify" | "expand";
    modelString: string;
    providers: LLMProviderConfig[];
  }): Promise<AgentResult> {
    const model = parseModelString(params.modelString, params.providers);
    
    const result = await generateText({
      model,
      system: this.instructions,
      messages: [{ role: "user", content: this.buildPrompt(params) }],
      tools: this.toolsToRecord(this.tools),
      maxSteps: 3,
    });

    return {
      content: result.text,
      toolCalls: this.extractToolCalls(result.steps),
    };
  }

  private buildPrompt(params: any): string {
    // Build task-specific prompt
  }
}
```

2. **Add factory** (`logic/agents/index.ts`):
```typescript
export function createWritingAgent() {
  return new WritingAgent(
    "You are a professional writing assistant...",
    []  // Add relevant tools
  );
}
```

3. **Write tests** (`logic/agents/writing-agent.test.ts`)

### Task 4: Modify Provider Configuration UI

**Example**: Adding model validation

1. **Update Options component** (`entrypoints/options/Options.vue`):
```vue
<script setup lang="ts">
const validateModels = (models: string[]) => {
  return models.every(m => {
    // Add validation logic
    return m.length > 0 && !m.includes(' ');
  });
};

const handleModelChange = (providerIndex: number, models: string) => {
  const modelArray = models.split(',').map(s => s.trim());
  if (!validateModels(modelArray)) {
    // Show error
    return;
  }
  // Update provider
};
</script>
```

2. **Add visual feedback**:
```vue
<div 
  class="border" 
  :class="{ 'border-red': !isValid }"
>
  <input v-model="modelsInput" @change="handleModelChange" />
</div>
```

### Task 5: Debug Failed Test

**Steps**:

1. **Run specific test**:
```bash
pnpm test provider-factory.test.ts
```

2. **Enable verbose mode**:
```bash
pnpm test --reporter=verbose
```

3. **Use test UI**:
```bash
pnpm test:ui
```

4. **Check test setup** (`tests/setup.ts`):
   - Ensure mocks are configured correctly
   - Verify global variables are set

5. **Common issues**:
   - Missing mock for browser API
   - webext-bridge not mocked properly
   - Async timing issues (use `await` properly)

## Design Patterns Used

### Strategy Pattern (Provider Creation)

**When to use**: When you have multiple algorithms (provider creation methods) that can be selected at runtime.

**Implementation**:
- Interface: `ProviderCreationStrategy`
- Concrete strategies: `OpenAIProviderStrategy`, etc.
- Context: `ProviderFactory`

### Factory Pattern (Agent Creation)

**When to use**: When object creation logic is complex or needs to be encapsulated.

**Implementation**:
- Factory functions: `createExplainAgent()`, `createWritingAgent()`
- Returns configured instances

### Dependency Injection

**When to use**: When a class depends on interfaces rather than concrete implementations.

**Implementation**:
- `ProviderFactory` accepts custom strategies
- `ExplainAgent` accepts tools array
- Enables testing with mocks

## Testing Best Practices

### Unit Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  let instance: ComponentType;
  
  beforeEach(() => {
    instance = new ComponentType();
  });

  describe('methodName', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = "test";
      
      // Act
      const result = instance.methodName(input);
      
      // Assert
      expect(result).toBe("expected");
    });

    it('should handle error case', () => {
      expect(() => instance.methodName(null)).toThrow();
    });
  });
});
```

### Testing Async Code

```typescript
it('should execute async operation', async () => {
  const result = await agent.execute(params);
  expect(result.content).toBeDefined();
});
```

### Mocking Dependencies

```typescript
import { vi } from 'vitest';

const mockFunction = vi.fn().mockResolvedValue({ success: true });

// Use in test
const result = await mockFunction();
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

## Common Pitfalls

### 1. Forgetting to Update Tests

❌ **Wrong**:
```typescript
// Add new feature
// Forget to add tests
```

✅ **Right**:
```typescript
// Add new feature
// Add corresponding tests
// Run: pnpm test
```

### 2. Violating SOLID Principles

❌ **Wrong**:
```typescript
class DoEverything {
  createProvider() { /* ... */ }
  parseModel() { /* ... */ }
  executeAgent() { /* ... */ }
  // Too many responsibilities
}
```

✅ **Right**:
```typescript
class ProviderFactory { /* Only creates providers */ }
class ModelParser { /* Only parses models */ }
class Agent { /* Only executes agent logic */ }
```

### 3. Not Handling Errors

❌ **Wrong**:
```typescript
const model = parseModelString(input, providers);
// Throws if invalid
```

✅ **Right**:
```typescript
try {
  const model = parseModelString(input, providers);
} catch (error) {
  return { content: "", error: error.message };
}
```

### 4. Hardcoding Configuration

❌ **Wrong**:
```typescript
const provider = createOpenAI({ 
  apiKey: "sk-hardcoded-key"  // Never do this
});
```

✅ **Right**:
```typescript
const provider = factory.createProvider(config);
```

## Performance Considerations

1. **Limit page content**: Truncate to 2000 chars to avoid token overflow
2. **Cache provider registry**: Don't recreate on every request
3. **Lazy load tools**: Only import tools when needed
4. **Use streaming**: For long responses (future enhancement)

## Security Best Practices

1. **Never log API keys**: Use console warnings, not logs
2. **Validate user input**: Check model strings before parsing
3. **Sanitize page content**: Remove sensitive data before sending to LLM
4. **Store keys locally**: Never send to backend

## Resources

- **Vercel AI SDK Docs**: https://ai-sdk.dev
- **Zod Documentation**: https://zod.dev
- **Vitest Guide**: https://vitest.dev
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID

## Getting Help

1. Check test files for usage examples
2. Review type definitions in `types.ts`
3. Read inline comments in source code
4. Run tests to understand behavior: `pnpm test --reporter=verbose`
