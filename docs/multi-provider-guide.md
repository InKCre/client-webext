# Multi-Provider LLM Support - User Guide

## Overview

The Explain Agent now supports multiple LLM providers with automatic fallback and manual model selection.

## Supported Providers

1. **OpenAI** - GPT models (gpt-4o-mini default)
2. **Anthropic** - Claude models (claude-3-5-sonnet-20241022 default)
3. **Google** - Gemini models (gemini-2.0-flash-exp default)

## Configuration (Options Page)

### Setting Up Providers

1. Open extension options (right-click extension icon → Options)
2. Scroll to "LLM 提供商配置" section
3. For each provider:
   - Enable/disable the checkbox
   - Enter API key
   - Customize model name (optional)
4. Select default provider from dropdown
5. Settings save automatically

### Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google**: https://aistudio.google.com/app/apikey

## Usage (Explain Sidepanel)

### Automatic Fallback

When you request an explanation:
1. Agent tries the default provider first
2. If it fails (API error, rate limit, etc.), automatically tries next enabled provider
3. Continues until successful or all providers exhausted
4. Error message shows which providers were tried if all fail

### Manual Model Selection

1. Open Explain sidepanel
2. Use the "模型" (Model) dropdown to select:
   - "默认" - Uses configured default provider
   - Specific provider/model combination
3. Selection persists for the session
4. If you switch models after getting an explanation, it automatically regenerates

### Provider Info Display

After a successful explanation:
- Bottom-left shows which provider/model was used
- Format: `{provider} ({model})`
- Example: `openai (gpt-4o-mini)`

## Migration from Legacy Setup

If you previously configured an OpenAI API key:
- It automatically migrates to the new multi-provider system
- Your existing key becomes the OpenAI provider's key
- No manual action needed

## Benefits

1. **Reliability**: If one provider is down, others take over automatically
2. **Flexibility**: Choose the best model for your needs
3. **Cost Control**: Switch between providers based on pricing
4. **Performance**: Try different models to see which gives best results
5. **Availability**: Continue working even if your primary provider has issues

## Troubleshooting

### "No LLM providers configured"
- At least one provider must be enabled with a valid API key
- Go to Options and configure at least one provider

### "All providers failed"
- Check all API keys are valid
- Verify you have credits/quota with at least one provider
- Check the error details to see what failed

### Provider appears disabled in model selector
- Provider is not enabled in Options, or
- Provider has no API key configured
- Go to Options to fix

## Examples

### Scenario 1: Primary + Backup
- Enable OpenAI (gpt-4o-mini) as default
- Enable Anthropic (claude-3-5-sonnet) as backup
- If OpenAI quota exceeded, Anthropic takes over automatically

### Scenario 2: Cost Optimization
- Use Google (gemini-2.0-flash-exp) as default (often cheaper)
- Keep OpenAI as fallback for complex queries
- Manually switch to Claude for specific tasks

### Scenario 3: Testing
- Enable all three providers
- Manually switch between them to compare results
- Choose the one that works best for your use case
