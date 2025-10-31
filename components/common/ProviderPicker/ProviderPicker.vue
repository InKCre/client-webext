<script setup lang="ts">
import { computed } from "vue";
import { llmProviders, selectedModel, defaultModel } from "~/logic/storage";

const emit = defineEmits<{ change: [] }>();

// Compute available models from all providers
const availableModels = computed(() => {
    const models: { value: string; label: string; disabled: boolean }[] = [];

    llmProviders.value.forEach((provider) => {
        const hasApiKey = provider.apiKey && provider.apiKey.length > 0;
        provider.models.forEach((model) => {
            models.push({
                value: `${provider.id}:${model}`,
                label: `${provider.name} - ${model}`,
                disabled: !hasApiKey,
            });
        });
    });

    return models;
});

// Check if default model is configured
const isDefaultConfigured = computed(() => {
    if (!defaultModel.value) return false;
    const [providerId] = defaultModel.value.split(":");
    const providerConfig = llmProviders.value.find((p) => p.id === providerId);
    return (
        providerConfig &&
        providerConfig.apiKey &&
        providerConfig.apiKey.length > 0
    );
});

const handleChange = () => {
    emit("change");
};
</script>

<template>
    <div class="provider-picker">
        <label for="model-select" class="picker-label">模型:</label>
        <select
            id="model-select"
            v-model="selectedModel"
            class="picker-select"
            @change="handleChange"
        >
            <option value="" :disabled="!isDefaultConfigured">
                默认 ({{ defaultModel || "none" }})
            </option>
            <option
                v-for="model in availableModels"
                :key="model.value"
                :value="model.value"
                :disabled="model.disabled"
            >
                {{ model.label }}
                {{ model.disabled ? "(未配置)" : "" }}
            </option>
        </select>
    </div>
</template>

<style scoped lang="scss" src="./ProviderPicker.scss"></style>
