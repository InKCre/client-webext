import type { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    "tab-prev": { title: string | undefined };
    "get-current-tab": ProtocolWithReturn<
      { tabId: number },
      { title?: string }
    >;
    "open-sidepanel": {
      text: string;
      mode: string;
      url: string;
      pageContent?: string;
    };
    "set-taking-note-params": { text: string };
    "set-sidepanel-params": { mode: string; url: string };
    "set-explain-params": { text: string; url: string };
    "set-sidepanel-mode": { mode: string };
    "get-page-context": ProtocolWithReturn<{}, { pageContent?: string }>;
    "get-page-content": ProtocolWithReturn<{}, { pageContent?: string }>;
  }
}
