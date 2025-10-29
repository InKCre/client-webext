<script setup lang="ts">
import logo from "@/assets/inkcre.svg";
import { inkcreApi, stopwords, llmProviders, defaultModel } from "@/logic/storage";
import type { LLMProviderConfig, ProviderType } from "@/logic/storage";
import "uno.css";

// Computed property to handle stopwords array/string conversion
const stopwordsText = computed({
  get: () => (Array.isArray(stopwords.value) ? stopwords.value.join(", ") : ""),
  set: (value: string) => {
    const words = value
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
    stopwords.value = words;
  },
});

const getProviderTypeDisplayName = (type: ProviderType) => {
  const names: Record<ProviderType, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google Generative AI",
  };
  return names[type];
};

const getProviderTypeHelpUrl = (type: ProviderType) => {
  const urls: Record<ProviderType, string> = {
    openai: "https://platform.openai.com/api-keys",
    anthropic: "https://console.anthropic.com/settings/keys",
    google: "https://aistudio.google.com/app/apikey",
  };
  return urls[type];
};

// Add a new provider
const addProvider = () => {
  const newProvider: LLMProviderConfig = {
    id: `provider-${Date.now()}`,
    name: "New Provider",
    type: "openai",
    apiKey: "",
    models: [],
  };
  llmProviders.value = [...llmProviders.value, newProvider];
};

// Remove a provider
const removeProvider = (index: number) => {
  const providers = [...llmProviders.value];
  providers.splice(index, 1);
  llmProviders.value = providers;
};

// Update provider field
const updateProvider = (index: number, field: keyof LLMProviderConfig, value: any) => {
  const providers = [...llmProviders.value];
  (providers[index] as any)[field] = value;
  llmProviders.value = providers;
};

// Update models (from comma-separated string)
const getModelsText = (models: string[]) => {
  return models.join(", ");
};

const setModelsText = (index: number, value: string) => {
  const models = value
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
  updateProvider(index, "models", models);
};

// Compute available model options for default selection
const availableDefaultModels = computed(() => {
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
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <img :src="logo" class="icon-btn mx-2 text-2xl" alt="InKCre Logo" />

    <!-- Environment Variables Display -->
    <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Environment Variables</h3>
      <div class="text-left space-y-4">
        <div class="flex items-center space-x-2">
          <label for="inkcre-api" class="font-medium">INKCRE_API:</label>
          <input
            id="inkcre-api"
            v-model="inkcreApi"
            type="url"
            class="flex-1 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            placeholder="https://api.inkcre.com"
          />
        </div>

        <!-- LLM Provider Configuration -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-base">LLM 提供商配置</h4>
            <button
              @click="addProvider"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              + 添加提供商
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            配置 LLM 提供商的 API Key、Base URL 和可用模型。在 Explain 侧边栏可以选择使用哪个模型。
          </p>

          <div class="space-y-2">
            <label for="default-model" class="font-medium block">默认模型:</label>
            <select
              id="default-model"
              v-model="defaultModel"
              class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option 
                v-for="model in availableDefaultModels" 
                :key="model.value" 
                :value="model.value"
                :disabled="model.disabled"
              >
                {{ model.label }}
                {{ model.disabled ? '(未配置 API Key)' : '' }}
              </option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              在 Explain 侧边栏未手动选择模型时使用此默认模型。
            </p>
          </div>

          <div v-for="(provider, index) in llmProviders" :key="provider.id" class="border border-gray-300 dark:border-gray-600 rounded p-3 space-y-2">
            <div class="flex items-center justify-between">
              <input
                :value="provider.name"
                @input="(e) => updateProvider(index, 'name', (e.target as HTMLInputElement).value)"
                type="text"
                class="font-medium px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm flex-1 mr-2"
                placeholder="Provider Name"
              />
              <button
                @click="removeProvider(index)"
                class="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900"
              >
                删除
              </button>
            </div>

            <div class="space-y-2">
              <div>
                <label class="text-sm font-medium block">类型:</label>
                <select
                  :value="provider.type"
                  @change="(e) => updateProvider(index, 'type', (e.target as HTMLSelectElement).value)"
                  class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option value="openai">{{ getProviderTypeDisplayName('openai') }}</option>
                  <option value="anthropic">{{ getProviderTypeDisplayName('anthropic') }}</option>
                  <option value="google">{{ getProviderTypeDisplayName('google') }}</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium block">API Key:</label>
                <input
                  :value="provider.apiKey"
                  @input="(e) => updateProvider(index, 'apiKey', (e.target as HTMLInputElement).value)"
                  type="password"
                  class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label class="text-sm font-medium block">Base URL (可选, 用于 OpenAI 兼容的提供商):</label>
                <input
                  :value="provider.baseURL || ''"
                  @input="(e) => updateProvider(index, 'baseURL', (e.target as HTMLInputElement).value || undefined)"
                  type="url"
                  class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder="https://api.example.com/v1"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  留空使用默认 API 端点。设置自定义 URL 可使用兼容 OpenAI API 的服务（如 OpenRouter, Together AI 等）。
                </p>
              </div>

              <div>
                <label class="text-sm font-medium block">可用模型 (逗号分隔):</label>
                <input
                  :value="getModelsText(provider.models)"
                  @input="(e) => setModelsText(index, (e.target as HTMLInputElement).value)"
                  type="text"
                  class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 text-sm font-mono"
                  placeholder="gpt-4o, gpt-4o-mini"
                />
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-400">
                获取 API key: 
                <a :href="getProviderTypeHelpUrl(provider.type)" target="_blank" class="text-blue-600 dark:text-blue-400">
                  {{ getProviderTypeDisplayName(provider.type) }}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label for="stopwords" class="font-medium block"
            >Stopwords (comma-separated):</label
          >
          <textarea
            id="stopwords"
            v-model="stopwordsText"
            rows="6"
            class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
            placeholder="Enter stopwords separated by commas..."
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            These words will be excluded from writing suggestions. Changes are
            saved automatically.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
