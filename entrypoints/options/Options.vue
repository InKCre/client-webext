<script setup lang="ts">
import logo from "@/assets/inkcre.svg";
import { inkcreApi, stopwords, llmProviders, defaultLLMProviderIndex } from "@/logic/storage";
import type { LLMProviderConfig } from "@/logic/storage";
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

const getProviderDisplayName = (provider: string) => {
  const names: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google (Gemini)",
  };
  return names[provider] || provider;
};

const toggleProvider = (index: number) => {
  const providers = [...llmProviders.value];
  providers[index].enabled = !providers[index].enabled;
  llmProviders.value = providers;
};

const updateProviderApiKey = (index: number, apiKey: string) => {
  const providers = [...llmProviders.value];
  providers[index].apiKey = apiKey;
  llmProviders.value = providers;
};

const updateProviderModel = (index: number, model: string) => {
  const providers = [...llmProviders.value];
  providers[index].model = model;
  llmProviders.value = providers;
};
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
          <h4 class="font-semibold text-base">LLM 提供商配置</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            配置多个 LLM 提供商，Explain Agent 将使用默认模型，失败时自动回退到其他可用模型。
          </p>

          <div class="space-y-2">
            <label for="default-provider" class="font-medium block">默认提供商:</label>
            <select
              id="default-provider"
              v-model="defaultLLMProviderIndex"
              class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option 
                v-for="(provider, index) in llmProviders" 
                :key="index" 
                :value="index"
              >
                {{ getProviderDisplayName(provider.provider) }} - {{ provider.model }}
              </option>
            </select>
          </div>

          <div v-for="(provider, index) in llmProviders" :key="index" class="border border-gray-300 dark:border-gray-600 rounded p-3 space-y-2">
            <div class="flex items-center justify-between">
              <h5 class="font-medium">{{ getProviderDisplayName(provider.provider) }}</h5>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="provider.enabled"
                  @change="toggleProvider(index)"
                  class="cursor-pointer"
                />
                <span class="text-sm">启用</span>
              </label>
            </div>

            <div class="space-y-2">
              <div>
                <label :for="`${provider.provider}-api-key`" class="text-sm font-medium block">API Key:</label>
                <input
                  :id="`${provider.provider}-api-key`"
                  :value="provider.apiKey"
                  @input="(e) => updateProviderApiKey(index, (e.target as HTMLInputElement).value)"
                  type="password"
                  class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  :placeholder="`${provider.provider === 'openai' ? 'sk-...' : provider.provider === 'anthropic' ? 'sk-ant-...' : 'API key'}`"
                />
              </div>

              <div>
                <label :for="`${provider.provider}-model`" class="text-sm font-medium block">模型:</label>
                <input
                  :id="`${provider.provider}-model`"
                  :value="provider.model"
                  @input="(e) => updateProviderModel(index, (e.target as HTMLInputElement).value)"
                  type="text"
                  class="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  :placeholder="provider.model"
                />
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-400">
                <template v-if="provider.provider === 'openai'">
                  获取 API key: <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-600 dark:text-blue-400">OpenAI Platform</a>
                </template>
                <template v-else-if="provider.provider === 'anthropic'">
                  获取 API key: <a href="https://console.anthropic.com/settings/keys" target="_blank" class="text-blue-600 dark:text-blue-400">Anthropic Console</a>
                </template>
                <template v-else-if="provider.provider === 'google'">
                  获取 API key: <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-600 dark:text-blue-400">Google AI Studio</a>
                </template>
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
