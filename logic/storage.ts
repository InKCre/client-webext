import { useWebExtensionStorage } from "~/composables/useWebExtensionStorage";

// INKCRE_API storage with default from environment variable
export const { data: inkcreApi, dataReady: inkcreApiReady } =
  useWebExtensionStorage(
    "inkcre-api",
    import.meta.env.VITE_INKCRE_API || "https://api.inkcre.com"
  );

// Default English stopwords list
export const DEFAULT_STOPWORDS = [
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "can",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "when",
  "where",
  "why",
  "how",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "that",
  "this",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "mine",
  "yours",
  "hers",
  "ours",
  "theirs",
  "in",
  "on",
  "at",
  "to",
  "from",
  "by",
  "with",
  "for",
  "of",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "among",
  "up",
  "down",
  "out",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
];

// Stopwords storage with default list
export const { data: stopwords, dataReady: stopwordsReady } =
  useWebExtensionStorage("stopwords", DEFAULT_STOPWORDS);

// LLM Provider configuration types
export interface LLMProviderConfig {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  models: string[]; // List of available models
}

export const DEFAULT_LLM_PROVIDERS: LLMProviderConfig[] = [
  {
    provider: "openai",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    provider: "anthropic",
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  },
  {
    provider: "google",
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
    models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
];

// LLM providers storage
export const { data: llmProviders, dataReady: llmProvidersReady } =
  useWebExtensionStorage("llm-providers", DEFAULT_LLM_PROVIDERS);

// Selected model string in format "provider:model"
export const { data: selectedModel, dataReady: selectedModelReady } =
  useWebExtensionStorage("selected-model", "openai:gpt-4o-mini");

// Default model string in format "provider:model"
export const { data: defaultModel, dataReady: defaultModelReady } =
  useWebExtensionStorage("default-model", "openai:gpt-4o-mini");
