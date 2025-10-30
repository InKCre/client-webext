// Provider registry using Vercel AI SDK's provider management
// https://ai-sdk.dev/docs/ai-sdk-core/provider-management
// Refactored to follow SOLID principles

import { createProviderRegistry } from "ai";
import { ProviderFactory } from "./provider-factory";
import type { LLMProviderConfig } from "./storage";

/**
 * Create a provider registry with custom provider support
 * Uses ProviderFactory to delegate provider creation (Strategy Pattern)
 * Follows Single Responsibility Principle - only handles registry creation
 */
export function createLLMProviderRegistry(providers: LLMProviderConfig[]) {
  const factory = new ProviderFactory();
  const providerMap: Record<string, any> = {};

  // Register each provider using factory
  providers.forEach((config) => {
    const provider = factory.createProvider(config);
    if (provider) {
      providerMap[config.id] = provider;
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
