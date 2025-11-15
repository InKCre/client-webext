<template>
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
</template>

<script setup lang="ts">
import { sendMessage } from "webext-bridge/content-script";
import takingNote from "~/assets/taking-note.svg";

function handleTakingNote() {
    const text = window.getSelection()?.toString() || "";
    sendMessage("open-sidepanel", {
        text,
        mode: "taking-note",
        url: window.location.href,
    });
}
</script>
