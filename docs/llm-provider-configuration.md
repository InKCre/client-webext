# LLM Provider Configuration Guide

## Overview

InKCre WebExt supports multiple LLM providers with flexible configuration. You can add custom providers, configure API endpoints, and manage multiple models from different sources.

## Supported Provider Types

### Native Providers
1. **OpenAI** - GPT models
2. **Anthropic** - Claude models  
3. **Google Generative AI** - Gemini models

### OpenAI-Compatible Providers
Any service that implements the OpenAI API format can be configured by setting a custom `baseURL`. Examples:
- OpenRouter
- Together AI
- Groq
- Local LLM servers (Ollama, LM Studio, etc.)

## Configuration Structure

Each provider configuration includes:

```typescript
{
  id: string;        // Unique identifier (auto-generated)
  name: string;      // Display name
  type: ProviderType; // "openai" | "anthropic" | "google"
  apiKey: string;    // API key
  baseURL?: string;  // Optional custom API endpoint
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

#### OpenRouter (OpenAI-compatible)
```
Name: OpenRouter
Type: OpenAI
API Key: sk-or-v1-...
Base URL: https://openrouter.ai/api/v1
Models: anthropic/claude-3.5-sonnet, google/gemini-2.0-flash-exp
```

#### Ollama (Local)
```
Name: Ollama Local
Type: OpenAI
API Key: (any value, not used)
Base URL: http://localhost:11434/v1
Models: llama3.2, qwen2.5
```

#### Together AI
```
Name: Together AI
Type: OpenAI
API Key: ...
Base URL: https://api.together.xyz/v1
Models: meta-llama/Llama-3.3-70B-Instruct-Turbo
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

When a `baseURL` is set, the provider uses it instead of the default API endpoint. This enables:

1. **OpenAI-compatible services**: Any service implementing OpenAI API format
2. **Self-hosted models**: Local LLM servers
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

For maximum flexibility, you can configure OpenAI-compatible providers to access any LLM service:

```
Name: Custom LLM
Type: OpenAI  
API Key: your-api-key
Base URL: https://your-service.com/v1
Models: your-model-1, your-model-2
```

The system will use OpenAI SDK with your custom configuration, enabling compatibility with diverse LLM services.
