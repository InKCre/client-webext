# LLM Provider Configuration Guide

> **For Developers**: See [Agent Development Guide](./agent-development-guide.md) | [Architecture Instructions](../.github/instructions/explain-agent.instructions.md)

## Overview

InKCre WebExt supports multiple LLM providers with flexible configuration. You can add custom providers, configure API endpoints, and manage multiple models from different sources.

**Key Features**:
- Dynamic provider management (add/remove providers)
- Support for native APIs (OpenAI, Anthropic, Google)
- OpenAI-compatible provider type for custom endpoints
- Local API key storage (never sent to InKCre Core)

## Supported Provider Types

### Native Providers
1. **OpenAI** - GPT models from OpenAI
2. **Anthropic** - Claude models from Anthropic
3. **Google Generative AI** - Gemini models from Google

### OpenAI-Compatible Provider Type
4. **OpenAI Compatible** - Dedicated provider type for services implementing OpenAI API format

You can use the **OpenAI Compatible** type for:
- OpenRouter
- Together AI
- Groq
- Ollama (local)
- LM Studio (local)
- Any other service with OpenAI-compatible API

**Note**: For native OpenAI, you can also use a custom `baseURL` with the "OpenAI" type to access alternative endpoints.

## Configuration Structure

Each provider configuration includes:

```typescript
{
  id: string;        // Unique identifier (auto-generated)
  name: string;      // Display name
  type: ProviderType; // "openai" | "anthropic" | "google" | "openai-compatible"
  apiKey: string;    // API key
  baseURL?: string;  // Optional for OpenAI, required for openai-compatible
  models: string[];  // Available model names
}
```

## Adding a Provider

### Via Options Page

1. Open extension options (right-click extension icon → Options)
2. Scroll to "LLM 提供商配置"
3. Click "+ 添加提供商"
4. Configure:
   - **Name**: Display name (e.g., "My OpenAI")
   - **Type**: Select provider type
   - **API Key**: Enter your API key
   - **Base URL** (optional): For custom endpoints
   - **Models**: Comma-separated list (e.g., "gpt-4o, gpt-4o-mini")

### Examples

#### Standard OpenAI
```
Name: OpenAI
Type: OpenAI
API Key: sk-...
Base URL: (leave empty)
Models: gpt-4o, gpt-4o-mini, gpt-4-turbo
```

#### OpenRouter
```
Name: OpenRouter
Type: OpenAI Compatible
API Key: sk-or-v1-...
Base URL: https://openrouter.ai/api/v1
Models: anthropic/claude-3.5-sonnet, google/gemini-2.0-flash-exp
```

#### Ollama (Local)
```
Name: Ollama Local
Type: OpenAI Compatible
API Key: ollama
Base URL: http://localhost:11434/v1
Models: llama3.2, qwen2.5
```

#### Together AI
```
Name: Together AI
Type: OpenAI Compatible
API Key: ...
Base URL: https://api.together.xyz/v1
Models: meta-llama/Llama-3.3-70B-Instruct-Turbo
```

#### Groq
```
Name: Groq
Type: OpenAI Compatible
API Key: gsk_...
Base URL: https://api.groq.com/openai/v1
Models: llama-3.3-70b-versatile, mixtral-8x7b-32768
```

## Removing a Provider

1. Find the provider card in options
2. Click "删除" (Delete) button
3. Provider will be removed immediately

## Model Selection

### Default Model
Set in Options page under "默认模型". This model is used when no specific model is manually selected in the Explain sidepanel.

### Manual Selection
In the Explain sidepanel, use the "模型" dropdown to temporarily override the default and select a specific model for that session.

## Provider Registry Implementation

The implementation uses Vercel AI SDK's provider registry pattern:

```typescript
// Automatically creates registry with all configured providers
const registry = createLLMProviderRegistry(providers);

// Access models using providerId:modelName format
const model = registry.languageModel("openai-default:gpt-4o-mini");
```

## Base URL Support

### Required for OpenAI Compatible Type
When using the **OpenAI Compatible** provider type, `baseURL` is **required** and specifies the API endpoint.

### Optional for OpenAI Type
When using the **OpenAI** provider type, `baseURL` is optional:
- Leave empty to use OpenAI's official endpoint
- Set a custom URL to use alternative OpenAI-compatible services

Base URL support enables:
1. **OpenAI-compatible services**: Any service implementing OpenAI API format
2. **Self-hosted models**: Local LLM servers (Ollama, LM Studio)
3. **Proxy/gateway services**: Custom routing or rate limiting
4. **Regional endpoints**: Use region-specific API endpoints

## Model String Format

Models are referenced using the format: `{providerId}:{modelName}`

Examples:
- `openai-default:gpt-4o-mini`
- `custom-openrouter:anthropic/claude-3.5-sonnet`
- `local-ollama:llama3.2`

## Troubleshooting

### Provider not showing in model selector
- Check that API key is configured
- Verify at least one model is listed
- Check provider card for error messages

### "Provider not configured" error
- Ensure the provider exists in settings
- Verify API key is entered
- Check baseURL format if using custom endpoint

### Custom baseURL not working
- Verify URL format (must include /v1 for OpenAI-compatible)
- Test endpoint connectivity
- Check if service requires authentication headers

## API Key Security

- All API keys stored locally in extension storage
- Never transmitted to InKCre Core
- Keys encrypted by browser's storage API
- Each provider has independent key configuration

## Best Practices

1. **Use descriptive names**: "OpenAI Production", "Ollama Dev", etc.
2. **List only available models**: Keep model list accurate
3. **Test custom endpoints**: Verify baseURL works before saving
4. **Backup configuration**: Export settings if reconfiguring
5. **Separate keys**: Use different API keys for different purposes

## Advanced: Custom Provider Setup

### Using OpenAI Compatible Type
For services that implement the OpenAI API format, use the dedicated **OpenAI Compatible** type:

```
Name: Custom LLM Service
Type: OpenAI Compatible
API Key: your-api-key
Base URL: https://your-service.com/v1
Models: your-model-1, your-model-2
```

This uses the `@ai-sdk/openai-compatible` provider specifically designed for OpenAI-compatible services.

### Alternative: OpenAI Type with Custom Base URL
You can also use the **OpenAI** type with a custom `baseURL`:

```
Name: Custom Endpoint
Type: OpenAI  
API Key: your-api-key
Base URL: https://your-service.com/v1
Models: your-model-1, your-model-2
```

Both approaches work with OpenAI-compatible services, but the **OpenAI Compatible** type is more explicit and recommended for non-OpenAI services.
