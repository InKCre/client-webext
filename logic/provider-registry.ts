// Provider registry using Vercel AI SDK's provider management
// https://ai-sdk.dev/docs/ai-sdk-core/provider-management

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createProviderRegistry } from "ai";
import type { LLMProviderConfig } from "./storage";

/**
 * Create a provider registry with custom provider support
 * Supports OpenAI, Anthropic, Google, and OpenAI-compatible custom providers
 */
export function createLLMProviderRegistry(providers: LLMProviderConfig[]) {
  const providerMap: Record<string, any> = {};

  // Register each provider
  providers.forEach((config) => {
    if (!config.apiKey) return;

    switch (config.type) {
      case "openai":
        // Use custom baseURL if provided for OpenAI-compatible providers
        providerMap[config.id] = createOpenAI({
          apiKey: config.apiKey,
          ...(config.baseURL && { baseURL: config.baseURL }),
        });
        break;
      case "anthropic":
        providerMap[config.id] = createAnthropic({
          apiKey: config.apiKey,
        });
        break;
      case "google":
        providerMap[config.id] = createGoogleGenerativeAI({
          apiKey: config.apiKey,
        });
        break;
      case "openai-compatible":
        // OpenAI-compatible providers require a baseURL
        if (!config.baseURL) {
          console.warn(
            `OpenAI-compatible provider ${config.id} requires a baseURL`,
          );
          return;
        }
        providerMap[config.id] = createOpenAICompatible({
          name: config.name,
          apiKey: config.apiKey,
          baseURL: config.baseURL,
        });
        break;
    }
  });

  return createProviderRegistry(providerMap);
}

/**
 * Parse model string in format "providerId:model" and return languageModel
 */
export function parseModelString(
  modelString: string,
  providers: LLMProviderConfig[],
) {
  const [providerId, model] = modelString.split(":");

  if (!providerId || !model) {
    throw new Error(
      `Invalid model string format: ${modelString}. Expected "providerId:model"`,
    );
  }

  const providerConfig = providers.find((p) => p.id === providerId);
  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error(`Provider ${providerId} not configured or missing API key`);
  }

  const registry = createLLMProviderRegistry(providers);
  return registry.languageModel(`${providerId}:${model}`);
}
