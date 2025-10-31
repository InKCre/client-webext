import { describe, it, expect, beforeEach } from "vitest";
import {
  ProviderFactory,
  OpenAIProviderStrategy,
  AnthropicProviderStrategy,
  GoogleProviderStrategy,
  OpenAICompatibleProviderStrategy,
  type ProviderCreationStrategy,
} from "@/logic/ai/provider-factory";
import type { LLMProviderConfig } from "@/logic/storage";

describe("Provider Factory", () => {
  let factory: ProviderFactory;

  beforeEach(() => {
    factory = new ProviderFactory();
  });

  describe("OpenAIProviderStrategy", () => {
    const strategy = new OpenAIProviderStrategy();

    it("should handle openai type", () => {
      expect(strategy.canHandle("openai")).toBe(true);
    });

    it("should not handle other types", () => {
      expect(strategy.canHandle("anthropic")).toBe(false);
      expect(strategy.canHandle("google")).toBe(false);
      expect(strategy.canHandle("openai-compatible")).toBe(false);
    });

    it("should create provider with API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenAI",
        type: "openai",
        apiKey: "sk-test-123",
        models: ["gpt-4o"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should create provider with custom baseURL", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenAI",
        type: "openai",
        apiKey: "sk-test-123",
        baseURL: "https://custom.openai.com/v1",
        models: ["gpt-4o"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should return null without API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenAI",
        type: "openai",
        apiKey: "",
        models: ["gpt-4o"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeNull();
    });
  });

  describe("AnthropicProviderStrategy", () => {
    const strategy = new AnthropicProviderStrategy();

    it("should handle anthropic type", () => {
      expect(strategy.canHandle("anthropic")).toBe(true);
    });

    it("should create provider with API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test Anthropic",
        type: "anthropic",
        apiKey: "sk-ant-test-123",
        models: ["claude-3-5-sonnet-20241022"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should return null without API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test Anthropic",
        type: "anthropic",
        apiKey: "",
        models: ["claude-3-5-sonnet-20241022"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeNull();
    });
  });

  describe("GoogleProviderStrategy", () => {
    const strategy = new GoogleProviderStrategy();

    it("should handle google type", () => {
      expect(strategy.canHandle("google")).toBe(true);
    });

    it("should create provider with API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test Google",
        type: "google",
        apiKey: "test-key-123",
        models: ["gemini-2.0-flash-exp"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });
  });

  describe("OpenAICompatibleProviderStrategy", () => {
    const strategy = new OpenAICompatibleProviderStrategy();

    it("should handle openai-compatible type", () => {
      expect(strategy.canHandle("openai-compatible")).toBe(true);
    });

    it("should create provider with API key and baseURL", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenRouter",
        type: "openai-compatible",
        apiKey: "sk-or-test-123",
        baseURL: "https://openrouter.ai/api/v1",
        models: ["anthropic/claude-3.5-sonnet"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should return null without baseURL", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenRouter",
        type: "openai-compatible",
        apiKey: "sk-or-test-123",
        models: ["anthropic/claude-3.5-sonnet"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeNull();
    });

    it("should return null without API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenRouter",
        type: "openai-compatible",
        apiKey: "",
        baseURL: "https://openrouter.ai/api/v1",
        models: ["anthropic/claude-3.5-sonnet"],
      };
      const provider = strategy.create(config);
      expect(provider).toBeNull();
    });
  });

  describe("ProviderFactory", () => {
    it("should create OpenAI provider", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenAI",
        type: "openai",
        apiKey: "sk-test-123",
        models: ["gpt-4o"],
      };
      const provider = factory.createProvider(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should create Anthropic provider", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test Anthropic",
        type: "anthropic",
        apiKey: "sk-ant-test-123",
        models: ["claude-3-5-sonnet-20241022"],
      };
      const provider = factory.createProvider(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should create Google provider", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test Google",
        type: "google",
        apiKey: "test-key-123",
        models: ["gemini-2.0-flash-exp"],
      };
      const provider = factory.createProvider(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should create OpenAI-compatible provider", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenRouter",
        type: "openai-compatible",
        apiKey: "sk-or-test-123",
        baseURL: "https://openrouter.ai/api/v1",
        models: ["anthropic/claude-3.5-sonnet"],
      };
      const provider = factory.createProvider(config);
      expect(provider).toBeDefined();
      expect(provider).not.toBeNull();
    });

    it("should return null for provider without API key", () => {
      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test OpenAI",
        type: "openai",
        apiKey: "",
        models: ["gpt-4o"],
      };
      const provider = factory.createProvider(config);
      expect(provider).toBeNull();
    });

    it("should allow registering custom strategy", () => {
      const customStrategy: ProviderCreationStrategy = {
        canHandle: (type) => type === "openai",
        create: () => ({ custom: true }),
      };

      factory.registerStrategy(customStrategy);

      const config: LLMProviderConfig = {
        id: "test-1",
        name: "Test",
        type: "openai",
        apiKey: "test-key",
        models: ["model-1"],
      };

      const provider = factory.createProvider(config);
      expect(provider).toBeDefined();
    });
  });
});
