import { useWebExtensionStorage } from "~/composables/useWebExtensionStorage";

// INKCRE_API storage with default from environment variable
export const { data: inkcreApi, dataReady: inkcreApiReady } =
  useWebExtensionStorage(
    "inkcre-api",
    import.meta.env.VITE_INKCRE_API || "https://api.inkcre.com",
  );

// Default English stopwords list (loaded from JSON)
import stopwordsList from "./stopwords.json";

export const DEFAULT_STOPWORDS: string[] = stopwordsList;

// Stopwords storage with default list
export const { data: stopwords, dataReady: stopwordsReady } =
  useWebExtensionStorage("stopwords", DEFAULT_STOPWORDS);

// LLM Provider configuration types
export type ProviderType = "openai" | "anthropic" | "google";

export interface LLMProviderConfig {
  id: string; // Unique identifier for the provider
  name: string; // Display name (e.g., "My OpenAI")
  type: ProviderType; // Provider type
  apiKey: string;
  baseURL?: string; // Optional base URL for OpenAI-compatible providers
  models: string[]; // List of available models
}

export const DEFAULT_LLM_PROVIDERS: LLMProviderConfig[] = [
  {
    id: "openai-default",
    name: "OpenAI",
    type: "openai",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    id: "anthropic-default",
    name: "Anthropic",
    type: "anthropic",
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
  },
  {
    id: "google-default",
    name: "Google Gemini",
    type: "google",
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
    models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
];

// LLM providers storage
export const { data: llmProviders, dataReady: llmProvidersReady } =
  useWebExtensionStorage("llm-providers", DEFAULT_LLM_PROVIDERS);

// Selected model string in format "providerId:model"
// Empty string means use default model
export const { data: selectedModel, dataReady: selectedModelReady } =
  useWebExtensionStorage("selected-model", "");

// Default model string in format "providerId:model"
export const { data: defaultModel, dataReady: defaultModelReady } =
  useWebExtensionStorage("default-model", "openai-default:gpt-4o-mini");
