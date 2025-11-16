<script setup lang="ts">
function openExplain() {
    browser.tabs.getCurrent().then((tab) => {
        browser.sidePanel.setOptions({
            path: "./explain.html",
            tabId: tab?.id,
        });
    });
}

function openTakingNote() {
    browser.tabs.getCurrent().then((tab) => {
        browser.sidePanel.setOptions({
            path: "./taking-note.html",
            tabId: tab?.id,
        });
    });
}
</script>

<template>
    <main class="features">
        <header class="header">
            <h1 class="title">InKCre</h1>
            <p class="subtitle">Choose a feature</p>
        </header>
        <section class="list">
            <button class="item" @click="openExplain">
                <span class="item-title">Explain</span>
                <span class="item-desc"
                    >Summarize or explain selected text or page</span
                >
            </button>
            <button class="item" @click="openTakingNote">
                <span class="item-title">Taking Note</span>
                <span class="item-desc"
                    >Capture notes and link related blocks</span
                >
            </button>
        </section>
    </main>
</template>

<style scoped lang="scss">
.features {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    gap: 12px;
}
.header {
    margin-bottom: 8px;
}
.title {
    font-size: 16px;
    margin: 0;
}
.subtitle {
    color: rgb(var(--color-muted));
    margin: 4px 0 0;
    font-size: 12px;
}
.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 12px;
    border: 1px solid rgb(var(--color-border));
    border-radius: 0;
    background: rgb(var(--color-surface));
    cursor: pointer;
}
.item:hover {
    background: rgb(var(--color-surface-2));
}
.item-title {
    font-weight: 600;
}
.item-desc {
    color: rgb(var(--color-muted));
    font-size: 12px;
}
</style>
