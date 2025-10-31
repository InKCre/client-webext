# TakingNote Component

A comprehensive note-taking component that allows users to create interconnected knowledge blocks with bidirectional relations in a star graph structure.

## Overview

The TakingNote component is a central feature of the InKCre extension that enables users to capture and organize information in a structured way. It implements a star graph model where a central block (the note) can have incoming and outgoing relations to other blocks, creating a rich knowledge network.

## Usage

```vue
<template>
  <TakingNote :url="currentPageUrl" @activate="handleActivation" />
</template>

<script setup lang="ts">
import TakingNote from "~/components/sidepanel/TakingNote/TakingNote.vue";

const currentPageUrl = ref("https://example.com");

const handleActivation = (tab: string) => {
  console.log("Activated tab:", tab);
};
</script>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | No | The URL of the current webpage, used to create automatic "excerpt" relations |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `activate` | `[tab: string]` | Emitted when the component should be activated (e.g., when receiving selected text) |

## Features

### Star Graph Structure

The component implements a star graph model with:
- **Central Block**: The main note content
- **Incoming Relations**: Relations pointing to the central block (from other blocks)
- **Outgoing Relations**: Relations pointing from the central block (to other blocks)

### Keyboard Shortcuts

- **Tab**: Add outgoing arc (creates new relation and block)
- **Shift+Tab**: Add incoming arc (creates new relation and block)
- **Alt+Shift**: Switch focus between block and relation editors within an arc

### Text Selection Integration

- Automatically receives selected text from web pages
- Selected text populates the main block with a flash animation
- Creates automatic "excerpt" relation to the source webpage

### Automatic Webpage Tracking

- Tracks the current webpage URL via props
- Creates or updates "节选" (excerpt) relation to webpage blocks
- Maintains link between notes and their source pages

### Dynamic Arc Management

- Add/remove incoming and outgoing arcs dynamically
- Navigate between arcs with keyboard shortcuts
- Visual navigation with counter and navigation buttons

## State Management

### Local State

```typescript
const selectedText = ref("");              // Text selected from webpage
const form = ref(new StarGraphForm(...));  // Main form data structure
const isFlashing = ref(false);             // Flash animation state
```

### Form Structure

```typescript
StarGraphForm {
  block: Block;                   // Central block
  in_relations: ArcForm[];        // Incoming relations
  out_relations: ArcForm[];       // Outgoing relations
}

ArcForm {
  relation: RelationForm;         // The relation
  from_block?: StarGraphForm;     // Source block (for incoming)
  to_block?: StarGraphForm;       // Target block (for outgoing)
}
```

## Message Handling

### Incoming Messages

**`set-taking-note-params`**
```typescript
{
  text: string;  // Selected text to populate main block
}
```

Triggered when:
- User saves an explanation from Explain component
- User selects "Taking Note" action from ActionBar
- External components want to populate the note

## Methods

### `handleKeydown(event: KeyboardEvent)`

Handles keyboard shortcuts for arc management:
- Tab (without Alt): Add outgoing arc
- Shift+Tab (without Alt): Add incoming arc

### `submitText()`

Submits the complete star graph to the backend:
```typescript
function submitText() {
  form.value
    .create()
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
```

## Component Hierarchy

```
TakingNote
├── ArcsEditor (incoming)
│   ├── ArcEditor × N
│   │   ├── BlockEditor
│   │   └── RelationEditor
│   └── Navigation Controls
├── BlockEditor (main)
└── ArcsEditor (outgoing)
    ├── ArcEditor × N
    │   ├── RelationEditor
    │   └── BlockEditor
    └── Navigation Controls
```

## Styling

### Key Features

- White background with padding
- Flash animation on text reception (red border pulse)
- Smooth transitions on interactions
- Focus states for accessibility
- Responsive layout with flexbox

### CSS Classes

- `.taking-note-container` - Main container with focus management
- `.taking-note-content` - Content wrapper with vertical layout
- `.main-block-editor` - Central block with enhanced border states
- `.flash-border` - Animation class for text reception feedback
- `.submit-button` - Action button with hover and active states
- `.pressed` - Button pressed state
- `.scrollbar-hide` - Hide scrollbars while maintaining scroll

### Animations

**Flash Animation** (0.5s)
```scss
0%   -> gray border
50%  -> red border (highlight)
100% -> gray border
```

## Integration Flow

### Note Creation from Selection

1. User selects text on webpage
2. User clicks "Taking Note" in ActionBar
3. ContentScript sends message with selected text
4. Component receives `set-taking-note-params` message
5. Selected text populates main block with flash animation
6. Webpage URL creates automatic "excerpt" relation
7. User adds additional relations and context
8. User clicks Submit to save to backend

### Note Creation from Explanation

1. User gets AI explanation in Explain component
2. User clicks "Save" button
3. Explanation text sent to TakingNote
4. Main block populated with explanation
5. User can add context and relations
6. Submit to save

## URL Tracking

The component watches the `url` prop and automatically:

1. Checks if an "excerpt" relation exists
2. If exists: Updates the webpage block content
3. If not exists: Creates new "excerpt" relation with webpage block

```typescript
watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      const webpageArcIndex = form.value.in_relations.findIndex(
        (arc) => arc.relation.content === "节选"
      );

      if (webpageArcIndex !== -1) {
        // Update existing
        const webpageBlock = form.value.in_relations[webpageArcIndex].from_block?.block;
        if (webpageBlock) {
          webpageBlock.content = newUrl;
        }
      } else {
        // Create new
        form.value.in_relations.push(
          new ArcForm(
            { content: "节选" },
            null,
            new StarGraphForm(new Block("webpage", newUrl, "url"))
          )
        );
      }
    }
  }
);
```

## Dependencies

### Components

- `BlockEditor` - For editing block content
- `ArcsEditor` - For managing collections of arcs

### Logic Modules

- `~/logic/info-base/block` - Block data structures
- `~/logic/info-base/root` - Star graph and arc structures
- `webext-bridge` - Cross-context messaging

## Best Practices

1. **Always provide URL prop** when available for automatic webpage tracking
2. **Handle submission errors gracefully** with user feedback
3. **Clear form after successful submission** to prepare for next note
4. **Validate block content** before submission
5. **Preserve user input** during navigation between arcs
6. **Use keyboard shortcuts** for efficient note-taking workflow

## Accessibility

- Focus management with tabindex
- Keyboard navigation support
- Visual feedback for all actions
- Screen reader friendly structure
- Proper ARIA labels (can be enhanced)

## Performance Considerations

- Efficient watchers with specific dependencies
- Lazy rendering of arc editors
- Debounced auto-save (can be added)
- Memory cleanup on component unmount

## File Structure

- `TakingNote.vue` - Component template and logic
- `TakingNote.scss` - Styling with animations
- `TakingNote.md` - This documentation file

## Future Enhancements

Potential improvements:
- Auto-save drafts to local storage
- Undo/redo functionality
- Drag-and-drop arc reordering
- Template system for common note structures
- Rich text editing in blocks
- Tag system for categorization
- Search and filter existing notes
- Batch operations on arcs
- Export notes to various formats
- Collaborative editing features
- Voice input support
- Image and media attachment
- Automatic relation suggestions based on content

## Related Components

- `ArcsEditor.vue` - Manages arc collections
- `ArcEditor.vue` - Individual arc editing
- `BlockEditor.vue` - Block content editing
- `RelationEditor.vue` - Relation content editing
- `Explain.vue` - Sends saved explanations here

## Troubleshooting

### Flash animation not working
- Check that `isFlashing` is properly toggled
- Verify CSS animation is loaded
- Check timing of state changes

### Submit button not responding
- Verify form data is properly structured
- Check network connectivity
- Inspect browser console for errors
- Validate API endpoint configuration

### Arcs not adding properly
- Check keyboard event handlers are bound
- Verify ArcsEditor refs are properly set
- Check that Tab key is not being captured elsewhere

### URL tracking not working
- Ensure `url` prop is reactive
- Check watcher is properly set up
- Verify "节选" string matches expected relation content
