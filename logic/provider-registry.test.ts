import { describe, it, expect, beforeEach } from 'vitest';
import { createLLMProviderRegistry, parseModelString } from './provider-registry';
import type { LLMProviderConfig } from './storage';

describe('Provider Registry', () => {
  let mockProviders: LLMProviderConfig[];

  beforeEach(() => {
    mockProviders = [
      {
        id: 'openai-1',
        name: 'OpenAI',
        type: 'openai',
        apiKey: 'sk-test-123',
        models: ['gpt-4o', 'gpt-4o-mini'],
      },
      {
        id: 'anthropic-1',
        name: 'Anthropic',
        type: 'anthropic',
        apiKey: 'sk-ant-test-456',
        models: ['claude-3-5-sonnet-20241022'],
      },
      {
        id: 'openrouter-1',
        name: 'OpenRouter',
        type: 'openai-compatible',
        apiKey: 'sk-or-test-789',
        baseURL: 'https://openrouter.ai/api/v1',
        models: ['anthropic/claude-3.5-sonnet'],
      },
    ];
  });

  describe('createLLMProviderRegistry', () => {
    it('should create a registry with OpenAI provider', () => {
      const registry = createLLMProviderRegistry([mockProviders[0]]);
      expect(registry).toBeDefined();
      expect(typeof registry.languageModel).toBe('function');
    });

    it('should create a registry with Anthropic provider', () => {
      const registry = createLLMProviderRegistry([mockProviders[1]]);
      expect(registry).toBeDefined();
    });

    it('should create a registry with OpenAI-compatible provider', () => {
      const registry = createLLMProviderRegistry([mockProviders[2]]);
      expect(registry).toBeDefined();
    });

    it('should create a registry with multiple providers', () => {
      const registry = createLLMProviderRegistry(mockProviders);
      expect(registry).toBeDefined();
    });

    it('should skip providers without API key', () => {
      const providersWithMissingKey: LLMProviderConfig[] = [
        { ...mockProviders[0], apiKey: '' },
      ];
      const registry = createLLMProviderRegistry(providersWithMissingKey);
      expect(registry).toBeDefined();
    });

    it('should skip openai-compatible providers without baseURL', () => {
      const providersWithMissingBaseURL: LLMProviderConfig[] = [
        {
          id: 'incomplete-1',
          name: 'Incomplete',
          type: 'openai-compatible',
          apiKey: 'test-key',
          models: ['model-1'],
        },
      ];
      const registry = createLLMProviderRegistry(providersWithMissingBaseURL);
      expect(registry).toBeDefined();
    });
  });

  describe('parseModelString', () => {
    it('should parse valid model string', () => {
      const model = parseModelString('openai-1:gpt-4o', mockProviders);
      expect(model).toBeDefined();
    });

    it('should throw error for invalid format', () => {
      expect(() => parseModelString('invalid-format', mockProviders)).toThrow(
        'Invalid model string format'
      );
    });

    it('should throw error for missing provider ID', () => {
      expect(() => parseModelString(':gpt-4o', mockProviders)).toThrow(
        'Invalid model string format'
      );
    });

    it('should throw error for missing model name', () => {
      expect(() => parseModelString('openai-1:', mockProviders)).toThrow(
        'Invalid model string format'
      );
    });

    it('should throw error for non-existent provider', () => {
      expect(() =>
        parseModelString('nonexistent:model', mockProviders)
      ).toThrow('Provider nonexistent not configured or missing API key');
    });

    it('should throw error for provider without API key', () => {
      const providersWithoutKey = [
        { ...mockProviders[0], apiKey: '' },
      ];
      expect(() =>
        parseModelString('openai-1:gpt-4o', providersWithoutKey)
      ).toThrow('Provider openai-1 not configured or missing API key');
    });
  });
});
