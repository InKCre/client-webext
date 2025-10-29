// Explain Agent implementation using Vercel AI SDK (browser-compatible)
// Uses the same AI SDK that VoltAgent is built on

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type { AgentResult, AITool } from "./types";
import type { LLMProviderConfig } from "../storage";

export class ExplainAgent {
  private tools: AITool[];
  private instructions: string;
  private name: string;

  constructor(
    name: string,
    instructions: string,
    tools: AITool[]
  ) {
    this.name = name;
    this.instructions = instructions;
    this.tools = tools;
  }

  /**
   * Create a model instance from provider configuration
   */
  private createModel(config: LLMProviderConfig): LanguageModel | null {
    if (!config.apiKey || !config.enabled) {
      return null;
    }

    try {
      switch (config.provider) {
        case "openai":
          return openai(config.model, { apiKey: config.apiKey });
        case "anthropic":
          return anthropic(config.model, { apiKey: config.apiKey });
        case "google":
          return google(config.model, { apiKey: config.apiKey });
        default:
          console.error(`Unknown provider: ${config.provider}`);
          return null;
      }
    } catch (error) {
      console.error(`Failed to initialize ${config.provider} model:`, error);
      return null;
    }
  }

  /**
   * Execute the agent with a given query and context
   * Supports provider selection and automatic fallback
   */
  async execute(params: {
    query: string;
    pageContent?: string;
    pageUrl?: string;
    contextBlockId?: number;
    providers: LLMProviderConfig[];
    selectedProviderIndex?: number;
  }): Promise<AgentResult> {
    const { providers, selectedProviderIndex } = params;

    // Filter enabled providers
    const enabledProviders = providers.filter((p) => p.enabled && p.apiKey);

    if (enabledProviders.length === 0) {
      return {
        content: "",
        error: "No LLM providers configured. Please set up at least one provider with an API key in the extension settings.",
      };
    }

    // Determine the order to try providers
    let providersToTry: LLMProviderConfig[];
    if (selectedProviderIndex !== undefined && providers[selectedProviderIndex]) {
      // If a specific provider is selected, try it first, then fallback to others
      const selectedProvider = providers[selectedProviderIndex];
      if (selectedProvider.enabled && selectedProvider.apiKey) {
        providersToTry = [
          selectedProvider,
          ...enabledProviders.filter((p) => p.provider !== selectedProvider.provider),
        ];
      } else {
        providersToTry = enabledProviders;
      }
    } else {
      // Use enabled providers in order
      providersToTry = enabledProviders;
    }

    // Build the context message
    let contextInfo = "";
    if (params.pageUrl) {
      contextInfo += `Current page URL: ${params.pageUrl}\n`;
    }
    if (params.pageContent) {
      // Limit page content to avoid token overflow
      const truncatedContent = params.pageContent.slice(0, 2000);
      contextInfo += `\nPage content preview:\n${truncatedContent}\n`;
    }
    if (params.contextBlockId) {
      contextInfo += `\nContext block ID: ${params.contextBlockId}\n`;
    }

    // Build the system message
    const systemMessage = this.instructions;
    const userMessage = contextInfo
      ? `${contextInfo}\n\nUser query: ${params.query}`
      : params.query;

    // Try each provider in order
    const errors: string[] = [];
    for (const providerConfig of providersToTry) {
      const model = this.createModel(providerConfig);
      if (!model) {
        errors.push(`${providerConfig.provider}: Model creation failed`);
        continue;
      }

      try {
        console.log(`Trying ${providerConfig.provider} (${providerConfig.model})...`);
        
        // Execute using Vercel AI SDK's generateText
        const result = await generateText({
          model,
          system: systemMessage,
          messages: [{ role: "user", content: userMessage }],
          tools: this.tools.reduce((acc, tool) => {
            acc[tool.name] = tool;
            return acc;
          }, {} as Record<string, AITool>),
          maxSteps: 5,
        });

        console.log(`Success with ${providerConfig.provider}`);
        
        return {
          content: result.text,
          toolCalls: result.steps
            ?.flatMap((step) =>
              step.toolCalls?.map((tc) => ({
                toolName: tc.toolName,
                parameters: tc.args,
                result: tc.result,
              }))
            )
            .filter((tc): tc is NonNullable<typeof tc> => tc !== undefined),
          usedProvider: providerConfig.provider,
          usedModel: providerConfig.model,
        };
      } catch (error: any) {
        const errorMsg = `${providerConfig.provider}: ${error.message || error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        // Continue to try next provider
      }
    }

    // All providers failed
    return {
      content: "",
      error: `All providers failed:\n${errors.join("\n")}`,
    };
  }
}
