// Test setup file for vitest
import { vi } from 'vitest';

// Mock browser API
global.browser = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
} as any;

// Mock webext-bridge
vi.mock('webext-bridge/background', () => ({
  sendMessage: vi.fn(),
}));

vi.mock('webext-bridge/content-script', () => ({
  onMessage: vi.fn(),
}));
