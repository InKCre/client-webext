// Agent framework types using Vercel AI SDK (browser-compatible)

import type { CoreTool } from "ai";

export type AITool = CoreTool;
export type AITools = Record<string, CoreTool>;

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
