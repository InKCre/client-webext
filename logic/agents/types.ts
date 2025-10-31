// Agent framework types using Vercel AI SDK (browser-compatible)

import type { Tool } from "ai";

export type AITool = Tool;
export type AITools = Record<string, Tool>;

/**
 * Agent execution result
 */
export interface AgentResult {
  content: string;
  toolCalls?: ToolCall[];
  error?: string;
  usedProvider?: string;
  usedModel?: string;
}

/**
 * Tool call record
 */
export interface ToolCall {
  toolName: string;
  parameters: any;
  result: any;
}
