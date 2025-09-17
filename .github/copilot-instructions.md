## 项目简介

这是一个浏览器插件项目，该插件的目的是帮助用户方便地使用 InKCre 。

InKCre 是一款知识库软件，致力于将数据、信息真正地服务于创造、生产，是真正的第二大脑。

## 在此仓库中高效工作的快速说明

下面为 AI 编码代理准备的简明、可操作指南，覆盖大局结构、构建/调试命令、项目约定和具体示例。

- 主要技术栈：Vue 3 + Vite + TypeScript，包管理使用 pnpm（见 `package.json`）。
- 入口与输出：Vite 的 `root` 指向 `src/`，构建产物输出到 `extension/dist/`（查看 `vite.config.mts`）。
- 主要运行命令：
  - 本地开发（带 HMR）：`pnpm dev`，或 `pnpm dev-firefox`（使用 Firefox 模式）。
  - 生成构建：`pnpm build`。
  - 运行/调试扩展：`pnpm start:chromium` / `pnpm start:firefox`（基于 `web-ext`）。
  - 打包产物：`pnpm pack:zip` / `pnpm pack:crx` / `pnpm pack:xpi`。
  - 测试：单元/集成 `pnpm test`（vitest），端到端 `pnpm test:e2e`（playwright）。

架构要点（必读文件示例）

- 动态 manifest：`src/manifest.ts` 生成 `extension/manifest.json`（生成脚本：`scripts/manifest.ts`，prepare 脚本在 `scripts/prepare.ts` 会调用它以便 dev 使用）。
- 多构建配置：项目针对 background、content-script 和 web UI 分别有 Vite 配置：`vite.config.background.mts`、`vite.config.content.mts`、主配置 `vite.config.mts`（注意不同 outDir、lib entry 和文件名约定）。
- 运行时别名：源码内使用 `~/` 别名指向 `src/`（见 `vite.config.mts`）。全局宏：`__DEV__`、`__NAME__` 在构建时注入。

通信与存储约定（示例）

- webext-bridge（类型化协议）用于跨上下文通信；类型定义见 `shim.d.ts` 的 `ProtocolMap`。
  - 后台发送消息示例：`sendMessage('tab-prev', { title }, { context: 'content-script', tabId })`（见 `src/background/main.ts`）。
  - 内容脚本接收示例：`onMessage('tab-prev', ({ data }) => { ... })`（见 `src/contentScripts/index.ts`）。
- 持久化：项目使用 `useWebExtensionStorage`（`src/composables/useWebExtensionStorage.ts`），示例导出在 `src/logic/storage.ts`。

开发 / HMR 注意事项

- Dev server 默认端口：3303（见 `scripts/utils.ts` 中的 `port`）。
- 为了在浏览器扩展环境使用 Vite dev server，`scripts/prepare.ts` 会生成 stub HTML（`extension/dist/*/index.html`）并调用 manifest 生成脚本；所以在 dev 模式下请确保先运行 `pnpm dev` 并在浏览器中加载 `extension/` 文件夹。
- Content script HMR：Firefox 会缓存 content script，HMR 在 Chromium 上更可靠；代码里有一个注入最新 content script 的辅助（`src/background/contentScriptHMR.ts`），它通过 `tabs.executeScript` 注入最新脚本。

编码风格与约定

- Vue：使用 Composition API 与 `<script setup>`。
- 自动导入：`unplugin-auto-import` 和 `unplugin-vue-components` 约定会自动引入 Vue API、`browser`（webextension-polyfill）以及组件；类型文件在 `src/auto-imports.d.ts`、`src/components.d.ts`。
- CSS：使用 UnoCSS，content script 的样式通过 `dist/contentScripts/style.css` 并以 `link` 注入到 shadow DOM（见 `src/contentScripts/index.ts`）。
- Lint/格式：ESLint + `@antfu/eslint-config`（`pnpm lint`）。Type checking：`pnpm typecheck`。

如何扩展/修改 manifest 或构建流程

- 修改 `src/manifest.ts` 来改变最终 `extension/manifest.json`。手动生成：`npx esno ./scripts/manifest.ts` 或运行 `pnpm build`/`pnpm dev`（`scripts/prepare.ts` 会在 dev 时自动触发）。

遇到问题时优先定位文件

- 运行/构建相关：`package.json` scripts、`scripts/prepare.ts`、`scripts/manifest.ts`、`scripts/utils.ts`。
- 通信/类型：`src/background/main.ts`、`src/contentScripts/index.ts`、`shim.d.ts`。
- 存储：`src/composables/useWebExtensionStorage.ts`、`src/logic/storage.ts`。
