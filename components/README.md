# Components Directory

This directory contains all Vue components for the InKCre web extension, organized by feature area and complexity.

## Directory Structure

```
components/
├── ai/                      # AI-related components
│   └── Response/            # LLM response renderer with markdown
├── block/                   # Block editing components
│   └── editor.vue          # Simple block content editor
├── common/                  # Shared/utility components
│   ├── loading.vue         # Loading indicator
│   ├── logo.vue            # InKCre logo display
│   └── ProviderPicker/     # LLM provider/model selector
├── contentScripts/          # Content script injected components
│   ├── ActionBar.vue       # Selection action bar
│   ├── Suggestion.vue      # Writing suggestion card
│   └── WritingAssist/      # Writing assistance panel
├── relation/                # Relation editing components
│   └── editor.vue          # Relation content editor
├── root/                    # Root/graph structure components
│   ├── ArcEditor.vue       # Single arc editor (block + relation)
│   └── ArcsEditor/         # Collection of arcs with navigation
└── sidepanel/               # Extension sidepanel components
    ├── Explain/            # AI explanation interface
    └── TakingNote/         # Note-taking with star graph

```

## Component Organization

### Single-File Components

Simple components with minimal styles remain as single `.vue` files:

- `block/editor.vue`
- `common/loading.vue`
- `common/logo.vue`
- `relation/editor.vue`
- `root/ArcEditor.vue`
- `contentScripts/ActionBar.vue`
- `contentScripts/Suggestion.vue`

### Multi-File Components

Complex components with substantial styles are organized into directories:

```
ComponentName/
├── ComponentName.vue    # Template and script logic
├── ComponentName.scss   # Styles with SCSS features
└── ComponentName.md     # Comprehensive documentation
```

Examples:
- `ai/Response/` - 188 lines of markdown styling
- `sidepanel/Explain/` - 257 lines with animations
- `root/ArcsEditor/` - 127 lines with navigation styles

## Component Categories

### AI Components (`ai/`)

**Response** - Renders markdown responses from LLMs with streaming support
- Comprehensive markdown styling (headings, code, tables, etc.)
- Loading and streaming states
- Blinking cursor animation

### Block Components (`block/`)

**editor** - Simple textarea for editing block content
- Minimal styling, mostly utility classes
- Auto-focus support
- Placeholder support

### Common Components (`common/`)

**loading** - Three-dot loading indicator
**logo** - InKCre logo SVG display
**ProviderPicker** - Dropdown for selecting LLM provider and model
- Detects configured providers
- Disables unconfigured options
- Monospace design aesthetic

### Content Script Components (`contentScripts/`)

These components are injected into web pages:

**ActionBar** - Appears on text selection
- Taking Note action
- Explain action
- Fixed positioning

**Suggestion** - Individual vocabulary suggestion card
- Original word display
- Replacement suggestion
- Copy to clipboard
- Hover interactions

**WritingAssist** - Floating panel for writing suggestions
- Monitors editable elements
- Fetches vocabulary improvements
- Debounced API calls
- Toast notifications
- Responsive layout

### Relation Components (`relation/`)

**editor** - Edits relation content between blocks
- Inline editing
- Two visual modes (x/y layout)
- Focus management

### Root Components (`root/`)

**ArcEditor** - Edits a single arc (block + relation)
- Combines BlockEditor and RelationEditor
- Keyboard navigation between components
- Focus management
- Alt+Shift to switch focus

**ArcsEditor** - Manages collection of arcs
- Horizontal scrolling
- Navigation controls (← →)
- Add/remove arcs
- Keyboard shortcuts (Alt+Tab, Shift+Delete)
- Smooth scrolling and animations

### Sidepanel Components (`sidepanel/`)

**Explain** - AI-powered text explanation
- Streaming LLM responses
- Model selection
- Editable query
- Page context integration
- Retry/stop/save actions
- Error handling

**TakingNote** - Create interconnected notes
- Star graph structure (central block + relations)
- Incoming and outgoing arcs
- Automatic webpage tracking
- Flash animation on text reception
- Submit to backend

## Styling Approach

### SCSS Files

Complex components use separate `.scss` files:

```vue
<style scoped lang="scss" src="./MyComponent.scss">
</style>
```

**Benefits**:
- Cleaner Vue files
- SCSS nesting and features
- Better organization
- Easier maintenance

### UnoCSS Utilities

Simple components use utility classes:

```vue
<div class="flex items-center gap-2 p-4">
```

**When to use**:
- Simple layouts
- Standard spacing/colors
- Rapid prototyping

## Component Communication

### Props & Events

Standard parent-child communication:

```vue
<Component :propName="value" @eventName="handler" />
```

### webext-bridge

Cross-context messaging for extension:

```typescript
// Content script to sidepanel
sendMessage('open-sidepanel', { text, mode });

// Listen in sidepanel
onMessage('set-explain-params', ({ data }) => {
  // Handle message
});
```

### Storage

Shared state via `@wxt-dev/storage`:

```typescript
import { llmProviders, selectedModel } from '~/logic/storage';
```

## Component Guidelines

### When to Create Multi-File Structure

✅ **Create directory when**:
- Component has >50 lines of CSS
- Uses complex nesting/animations
- Would benefit from detailed docs
- Has multiple related sub-components

❌ **Keep single file when**:
- Uses only utility classes
- CSS is <20 lines
- Simple, focused purpose

### Naming Conventions

- **Files**: PascalCase (e.g., `MyComponent.vue`)
- **Directories**: PascalCase (e.g., `MyComponent/`)
- **CSS Classes**: kebab-case (e.g., `.my-component`)
- **Props/Events**: camelCase (e.g., `modelValue`, `@update`)

### Documentation

Each multi-file component should have a `.md` file with:

- Overview
- Usage examples
- Props and events
- Features list
- Styling notes
- Dependencies
- Best practices
- Troubleshooting

See existing `.md` files for examples.

## Import Patterns

### Component Imports

```typescript
// Single-file component
import Logo from '~/components/common/logo.vue';

// Multi-file component
import Response from '~/components/ai/Response/Response.vue';

// With TypeScript
import type { ComponentInstance } from 'vue';
const componentRef = ref<InstanceType<typeof Component>>();
```

### Style Imports

```scss
// In SCSS file
@import "./ComponentName.scss";

// Future: shared variables
@import "~/styles/variables.scss";
```

## Testing

Components should be tested for:

- Visual appearance (screenshot tests)
- User interactions (click, type, etc.)
- Props and events
- Accessibility
- Error states

See `tests/` directory for examples.

## Accessibility

All components should:

- Use semantic HTML
- Include ARIA labels where needed
- Support keyboard navigation
- Maintain sufficient contrast
- Be screen reader friendly

## Performance

Optimization strategies:

- Lazy load heavy components
- Use `v-show` for frequently toggled elements
- Use `v-if` for conditionally rendered elements
- Debounce expensive operations
- Clean up event listeners in `onUnmounted`

## Future Improvements

Potential enhancements:

1. **Shared Style Variables**
   - Create `styles/_variables.scss`
   - Define colors, spacing, transitions
   - Import across components

2. **Component Library**
   - Extract common patterns
   - Create base components
   - Build design system

3. **Storybook Integration**
   - Interactive component showcase
   - Visual regression testing
   - Documentation generation

4. **More Documentation**
   - Add `.md` files for remaining complex components
   - Create visual diagrams
   - Record demo videos

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [SCSS Documentation](https://sass-lang.com/documentation)
- [UnoCSS Documentation](https://unocss.dev/)
- [WXT Framework](https://wxt.dev/)
- [webext-bridge](https://github.com/zikaari/webext-bridge)

## Contributing

When adding new components:

1. Choose appropriate directory
2. Follow naming conventions
3. Add documentation for complex components
4. Update this README if adding new categories
5. Test thoroughly in browser extension context
6. Submit PR with screenshots

---

For questions or suggestions, please open an issue or discussion in the repository.
