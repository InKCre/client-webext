import { onMessage, sendMessage } from "webext-bridge/background";

export default defineBackground(() => {
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
            {
              text: data.text,
              pageContent: data.pageContent || "",
              url: data.url,
            },
            { context: "popup", tabId: sender.tabId }
          );
        }
      }, 100);
    }, 400);
  });
});
