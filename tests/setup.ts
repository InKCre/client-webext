// Test setup file for vitest
import { vi } from "vitest";

// Mock WXT browser module
vi.mock("wxt/browser", () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
      },
    },
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
      sendMessage: vi.fn(),
      id: "test-extension-id",
    },
    action: {
      onClicked: {
        addListener: vi.fn(),
      },
    },
    sidePanel: {
      open: vi.fn(),
    },
  },
}));

// Mock webext-bridge
vi.mock("webext-bridge/background", () => ({
  sendMessage: vi.fn(),
  onMessage: vi.fn(),
}));

vi.mock("webext-bridge/content-script", () => ({
  onMessage: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("webext-bridge/popup", () => ({
  onMessage: vi.fn(),
  sendMessage: vi.fn(),
}));
