<script setup lang="ts">
import "uno.css";
import { onMessage } from "webext-bridge/content-script";
import ActionBar from "@/components/contentScripts/ActionBar.vue";
import WritingAssist from "@/components/contentScripts/WritingAssist.vue";

// Handle page context requests
onMessage("get-page-context", () => {
  return {
    pageUrl: window.location.href,
    pageContent: document.body.innerText || "",
  };
});
</script>

<template>
  <ActionBar />
  <WritingAssist />
</template>
