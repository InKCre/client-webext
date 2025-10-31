<template>
    <div
        v-show="showActionBar"
        class="fixed z-100 box-border flex gap-2 items-start justify-start overflow-clip px-1.5 py-1 rounded-[2px] bg-gray-100 min-w-[60px]"
        :style="{
            left: actionBarPosition.x + 'px',
            top: actionBarPosition.y + 'px',
        }"
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
        <div
            class="relative shrink-0 size-5 cursor-pointer"
            @click="handleExplain"
        >
            <img
                alt="Explain"
                class="block max-w-none size-full"
                :src="explain"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToggle } from "@vueuse/core";
import { sendMessage } from "webext-bridge/content-script";
import explain from "~/assets/explain.svg";
import takingNote from "~/assets/taking-note.svg";
import { Readability } from "@mozilla/readability";

const [showActionBar, toggleActionBar] = useToggle(false);
const actionBarPosition = ref({ x: 0, y: 0 });
const lastSelectionText = ref("");

const handleSelection = (event: MouseEvent) => {
    const selection = window.getSelection();
    const currentText = selection ? selection.toString().trim() : "";
    if (currentText && currentText !== lastSelectionText.value) {
        try {
            actionBarPosition.value = {
                x: event.clientX + 10,
                y: event.clientY + 10,
            };
            toggleActionBar(true);
            lastSelectionText.value = currentText;
        } catch (e) {
            // No valid range
            toggleActionBar(false);
            lastSelectionText.value = "";
        }
    }
};

const handleSelectionChange = () => {
    const selection = window.getSelection();
    const currentText = selection ? selection.toString().trim() : "";
    if (!currentText) {
        toggleActionBar(false);
        lastSelectionText.value = "";
    }
};

function handleTakingNote() {
    const text = window.getSelection()?.toString() || "";
    sendMessage("open-sidepanel", {
        text,
        mode: "taking-note",
        url: window.location.href,
    });
}

function openExplainSidePanel(selectedText: string, pageContent: string) {
    const url = window.location.href;
    sendMessage("open-sidepanel", {
        text: selectedText,
        mode: "explain",
        url,
        pageContent,
    });
}

function handleExplain() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const selectedText = selection.toString();
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();
    const pageContent = article?.textContent || "";
    openExplainSidePanel(selectedText, pageContent);
}

onMounted(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelectionChange);
});

onUnmounted(() => {
    document.removeEventListener("mouseup", handleSelection);
    document.removeEventListener("selectionchange", handleSelectionChange);
});
</script>
