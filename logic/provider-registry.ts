// Provider registry using Vercel AI SDK's provider management
// https://ai-sdk.dev/docs/ai-sdk-core/provider-management

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";
import type { LLMProviderConfig } from "./storage";

/**
 * Create a provider registry with middleware for API key injection
 */
export function createLLMProviderRegistry(providers: LLMProviderConfig[]) {
  const registry = createProviderRegistry({});

  // Register each provider with its API key
  providers.forEach((config) => {
    if (!config.apiKey) return;

    switch (config.provider) {
      case "openai":
        registry.registerProvider({
          id: "openai",
          provider: createOpenAI({ apiKey: config.apiKey }),
        });
        break;
      case "anthropic":
        registry.registerProvider({
          id: "anthropic",
          provider: createAnthropic({ apiKey: config.apiKey }),
        });
        break;
      case "google":
        registry.registerProvider({
          id: "google",
          provider: createGoogleGenerativeAI({ apiKey: config.apiKey }),
        });
        break;
    }
  });

  return registry;
}

/**
 * Parse model string in format "provider:model" and return languageModel
 */
export function parseModelString(modelString: string, providers: LLMProviderConfig[]) {
  const [provider, model] = modelString.split(":");
  
  if (!provider || !model) {
    throw new Error(`Invalid model string format: ${modelString}. Expected "provider:model"`);
  }

  const providerConfig = providers.find((p) => p.provider === provider);
  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error(`Provider ${provider} not configured or missing API key`);
  }

  const registry = createLLMProviderRegistry(providers);
  return registry.languageModel(`${provider}:${model}`);
}
