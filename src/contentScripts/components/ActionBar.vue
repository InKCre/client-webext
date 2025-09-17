<template>
  <div
    class="box-border flex gap-2 items-start justify-start overflow-clip px-1.5 py-1 relative rounded-[2px] bg-gray-100 min-w-[60px]"
  >
    <div
      class="relative shrink-0 size-5 cursor-pointer"
      @click="handleTakingNote"
    >
      <img
        alt="Taking Note"
        class="block max-w-none size-full"
        :src="takingNote"
      />
    </div>
    <div class="relative shrink-0 size-5 cursor-pointer" @click="handleExplain">
      <img alt="Explain" class="block max-w-none size-full" :src="explain" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { sendMessage } from "webext-bridge/content-script";
import explain from "~/assets/explain.svg";
import takingNote from "~/assets/taking-note.svg";
import { Readability } from "@mozilla/readability";
import { ArcForm, StarGraphForm } from "~/components/root";
import { Block, BlockForm } from "~/components/block";
import { RelationForm } from "~/components/relation";

function handleTakingNote() {
  const text = window.getSelection()?.toString() || "";
  sendMessage("open-sidepanel", {
    text,
    mode: "taking-note",
    url: window.location.href,
  });
}

function openExplainSidePanel(selectedText: string, contextBlock?: Block) {
  const url = window.location.href;
  sendMessage("open-sidepanel", {
    text: selectedText,
    mode: "explain",
    url,
    pageBlockId: contextBlock?.id,
  });
}

function handleExplain() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const selectedText = selection.toString();
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();
  if (article && article.textContent) {
    const graph = new StarGraphForm(
      new BlockForm("webpage", window.location.href, "url"),
      [
        new ArcForm(
          new RelationForm("text content"),
          new StarGraphForm(new BlockForm("text", article.textContent))
        ),
      ]
    );
    graph
      .create()
      .then((response) => response.json())
      .then((data) => {
        const pageBlock: Block = data.blocks.find(
          (item: Block) => item.resolver === "webpage"
        );
        openExplainSidePanel(selectedText, pageBlock);
      })
      .catch(() => openExplainSidePanel(selectedText));
  }
}
</script>
