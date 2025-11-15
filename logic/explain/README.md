---
description: "This document provides AI Coding guidelines to `logic/explain`, which is the logic behind the explain feature."
---

Tech Stacks:
- [Vercel AI SDK v5](https://ai-sdk.dev/docs/introduction)

Files:
- `tools.ts`: Tools for explain agent, build with [AI SDK Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

Best Practice:
- Errors occured in tool execution will be passed to LLM automatically by Vercel AI SDK.
- Make naming of tool inputSchema self-explanatory to save token.
