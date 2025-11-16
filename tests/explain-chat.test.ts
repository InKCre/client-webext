import { describe, it, expect, vi } from "vitest";
import type { Message } from "~/logic/explain/chat";

describe("Explain Chat Types", () => {
  it("should have correct message structure", () => {
    const userMessage: Message = {
      id: "test-1",
      role: "user",
      content: "What is this?",
    };

    expect(userMessage.role).toBe("user");
    expect(userMessage.content).toBe("What is this?");
    expect(userMessage.id).toBe("test-1");
  });

  it("should support assistant messages", () => {
    const assistantMessage: Message = {
      id: "test-2",
      role: "assistant",
      content: "This is an explanation.",
    };

    expect(assistantMessage.role).toBe("assistant");
    expect(assistantMessage.content).toBe("This is an explanation.");
  });
});
