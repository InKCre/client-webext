import { onMessage, sendMessage } from "webext-bridge/background";
import type { Tabs } from "webextension-polyfill";

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = true;

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error));
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log("Extension installed");
});

let previousTabId = 0;

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId;
    return;
  }

  let tab: Tabs.Tab;

  try {
    tab = await browser.tabs.get(previousTabId);
    previousTabId = tabId;
  } catch {
    return;
  }

  // eslint-disable-next-line no-console
  console.log("previous tab", tab);
  sendMessage(
    "tab-prev",
    { title: tab.title },
    { context: "content-script", tabId }
  );
});

onMessage("get-current-tab", async () => {
  try {
    const tab = await browser.tabs.get(previousTabId);
    return {
      title: tab?.title,
    };
  } catch {
    return {
      title: undefined,
    };
  }
});

onMessage("open-sidepanel", async ({ data, sender }) => {
  // Open the side panel (Chromium only)
  try {
    await (browser as any).sidePanel?.open({ tabId: sender.tabId });
  } catch (error) {
    console.error("Failed to open side panel:", error);
  }
  // Wait a bit for the sidepanel to load
  setTimeout(() => {
    sendMessage(
      "set-sidepanel-params",
      { mode: data.mode, url: data.url },
      { context: "popup", tabId: sender.tabId }
    );
    setTimeout(() => {
      if (data.mode === "taking-note") {
        sendMessage(
          "set-taking-note-params",
          { text: data.text },
          { context: "popup", tabId: sender.tabId }
        );
      } else if (data.mode === "explain") {
        sendMessage(
          "set-explain-params",
          { text: data.text, pageBlockId: data.pageBlockId },
          { context: "popup", tabId: sender.tabId }
        );
      }
    }, 200);
  }, 200);
});
