import { onMessage, sendMessage } from "webext-bridge/background";
import { browser } from "wxt/browser";

export default defineBackground(() => {
  onMessage("open-sidepanel", ({ sender }) => {
    browser.sidePanel?.open({ tabId: sender.tabId });
  });
  onMessage("new-task", async (message) => {
    sendMessage("new-task", message.data, "popup");
  });
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "get-tab-id") {
      sendResponse({ tabId: sender.tab?.id });
    }
    return true;
  });
});
