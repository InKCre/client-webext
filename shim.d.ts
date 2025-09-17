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
    "set-explain-params": { text: string; pageContent: string; url: string };
    "set-sidepanel-params": { mode: string; url: string };
  }
}
