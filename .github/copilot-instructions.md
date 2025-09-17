# InKCre Web Extension - AI Coding Guidelines

## Project Overview

InKCre is a browser extension for knowledge graph-based note-taking and AI-assisted writing. It allows users to create interconnected "blocks" of content with relations, forming a personal knowledge graph.

**Core Architecture:**

- **Blocks**: Content units with resolver types (text, webpage, etc.) and optional storage
- **Relations**: Directed connections between blocks with descriptive content
- **StarGraphs**: Graph structures containing a central block with incoming/outgoing relations
- **API Integration**: Connects to InKCre API for RAG (Retrieval-Augmented Generation) and graph operations

## Tech Stack & Build System

- **Framework**: WXT (Web Extension Toolkit) with Vue 3 + TypeScript
- **Styling**: UnoCSS with Wind3 preset, attributify mode, and icon support
- **Storage**: Custom `useWebExtensionStorage` composable wrapping @wxt-dev/storage
- **Communication**: webext-bridge for cross-context messaging
- **Build**: `pnpm run dev` (uses Helium browser), `pnpm build`, `pnpm zip`

## Key Patterns & Conventions

### Data Models

```typescript
// Core block with content and type
class Block {
  constructor(
    public resolver: string, // Content type: "text", "webpage", etc.
    public content: string,
    public storage?: string, // Storage type for content retrieval
    public id?: number,
    public updated_at?: Date
  ) {}
}

// Relations connect blocks
class Relation {
  constructor(
    public from_: number,
    public to_: number,
    public content: string, // Relation description
    public id?: number,
    public updated_at?: Date
  ) {}
}

// Graph structure for API submission
class StarGraphForm {
  constructor(
    public block: BlockForm,
    public out_relations: ArcForm[] = [],
    public in_relations: ArcForm[] = []
  ) {}
}
```

### Component Architecture

- **Entry Points**: background.ts, content/, popup/, options/, sidepanel/
- **Components**: Organized by feature (block/, common/, contentScripts/, relation/, root/, sidepanel/)
- **Logic**: Data models and business logic in logic/ directory
- **Composables**: Shared reactive logic in composables/

### UI/UX Patterns

- **Design Philosophy**: Monochrome minimalism + retro-futurism
- **Color Scheme**: Black, white, gray + red/cyan for emphasis
- **Component Naming**: Common components prefixed with `INK` (e.g., `INKLoading`)
- **Icons**: Use Iconify via UnoCSS - available in all components without imports

### Keyboard Shortcuts

```typescript
// In TakingNote component
Tab: Add outgoing relation + block
Shift+Tab: Add incoming relation + block
Alt+Tab: Switch focus between blocks/relations in current arc
Shift+Delete: Delete current arc
Shift+Backspace: Delete current arc
```

### Asset Management

```typescript
// Import assets with ~/pulic/ prefix
import logo from "~/public/logo.svg";

// Use in templates
<img :src="logo" alt="Logo" />
```

### Storage Pattern

```typescript
// Reactive storage with environment fallback
const { data: apiUrl, dataReady } = useWebExtensionStorage(
  "inkcre-api",
  import.meta.env.VITE_INKCRE_API || "https://api.inkcre.com"
);
```

### Communication Patterns

```typescript
// Background script message handling
onMessage("open-sidepanel", async ({ data, sender }) => {
  // Open sidepanel and pass data
  await browser.sidePanel?.open({ tabId: sender.tabId });
  sendMessage("set-sidepanel-params", data, {
    context: "popup",
    tabId: sender.tabId,
  });
});

// Component message receiving
onMessage("set-taking-note-params", ({ data }) => {
  selectedText.value = data.text;
});
```

### API Integration

```typescript
// RAG query for AI assistance
const result = await Root.RAG({
  query: "user question",
  retrieve_mode: "semantic",
  context_blocks: "block_ids",
});

// Create new graph
const response = await starGraphForm.create();
```

## Development Workflow

1. **Development**: `pnpm run dev` - starts dev server with hot reload
2. **Build**: `pnpm build` - production build for Chrome/Firefox
3. **Package**: `pnpm zip` - create extension package
4. **Type Check**: `pnpm run typecheck` - TypeScript validation

## Extension Contexts

- **Content Script**: Injects ActionBar/WritingAssist into all web pages
- **Popup**: Simple launcher opening options/sidepanel
- **Sidepanel**: Main UI with TakingNote and Explain tabs
- **Options**: Configuration page
- **Background**: Handles cross-context communication and sidepanel management

## Key Components

- **TakingNote**: Creates notes with block-relation graphs
- **Explain**: AI-powered content explanation using RAG
- **WritingAssist**: Text improvement suggestions in editing contexts
- **ActionBar**: Floating UI for triggering extension features

## Common Patterns

- Use `ref()` for reactive data, `computed()` for derived state
- Expose component methods with `defineExpose()`
- Handle keyboard events at container level with delegation
- Use `nextTick()` for DOM updates after reactive changes
- Follow Vue 3 Composition API patterns throughout

## File Organization

```
entrypoints/     # Extension contexts (background, content, popup, etc.)
components/      # Vue components by feature
logic/          # Data models and business logic
composables/    # Shared reactive utilities
styles/         # Global styles and UnoCSS setup
public/         # Extension manifest assets, static assets (icons, images)
```

Focus on creating interconnected knowledge structures, maintaining the minimalist aesthetic, and ensuring smooth cross-context communication.
