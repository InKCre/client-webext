This project is `inkcre-webext`, which is InKCre's browser extension.
InKCre is an information management tool to gather, organize and use any source and any type of information.
And so inkcre-webext is here to allow users interact with InKCre from their browsers, with following core features:
- Taking Notes
- Help Reading
- Assist creating, includes writing, designing, etc.

Tech Stacks:
- Framework: [WXT](https://wxt.dev) with Vue 3 + TypeScript
- Styling: UnoCSS with Wind3 preset, attributify mode, and icon support
- Storage: Custom useWebExtensionStorage composable wrapping @wxt-dev/storage
- Messaging: webext-bridge for cross-context messaging

File Organization:
- `entrypoints/`: background.ts, content, popup, options, sidepanel
- `components/`: Organized by feature (info-base, common, ai)
- `composables/`: Shared reactive logic
- `logic/`: Data models and business logic in logic/ directory

[UI/UX Patterns](./instructions/ui-ux.insructions.md)
