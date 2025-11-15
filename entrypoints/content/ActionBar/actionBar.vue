<template>
    <div
        v-show="showActionBar"
        class="fixed z-100 box-border flex gap-2 items-start justify-start overflow-clip px-1.5 py-1 rounded-[2px] bg-gray-100 min-w-[60px]"
        :style="{
            left: actionBarPosition.x + 'px',
            top: actionBarPosition.y + 'px',
        }"
    >
        <NoteAction />
        <ExplainAction />
    </div>
</template>

<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { onMounted, onUnmounted, ref } from "vue";
import ExplainAction from "./explainAction.vue";
import NoteAction from "./noteAction.vue";

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

onMounted(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelectionChange);
});

onUnmounted(() => {
    document.removeEventListener("mouseup", handleSelection);
    document.removeEventListener("selectionchange", handleSelectionChange);
});
</script>
