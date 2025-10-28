# Testing the Explain Agent

This guide helps you manually test the new VoltAgent-based Explain Agent implementation.

## Prerequisites

1. Build the extension: `pnpm run build`
2. Load the extension in your browser (Chrome/Chromium)
3. Get an OpenAI API key from https://platform.openai.com/api-keys

## Setup

1. Open the extension options page (right-click extension icon → Options)
2. Configure your OpenAI API key in the "OpenAI API Key" field
3. Configure your InKCre API URL (default: https://api.inkcre.com)
4. Save the settings (automatically saved)

## Test Cases

### Test 1: Basic Explanation
1. Navigate to any webpage
2. Select some text
3. Right-click and choose "Explain" (or use the action bar)
4. The sidepanel should open with the Explain tab active
5. Verify that:
   - The selected text appears in the query field
   - A loading indicator appears
   - An explanation is generated and displayed in Markdown format
   - No errors are shown

### Test 2: Explanation with Page Context
1. Navigate to a page with substantial content
2. Select a technical term or concept
3. Request an explanation
4. Verify that:
   - The explanation considers the page context
   - The page URL is visible in the context
   - The explanation is relevant to the page topic

### Test 3: Knowledge Base Integration
1. First, create some notes in InKCre related to a topic
2. Navigate to a page about the same topic
3. Select text and request an explanation
4. Verify that:
   - The agent retrieves relevant information from your knowledge base
   - The explanation incorporates your personal notes
   - Tool calls are visible in the developer console (optional)

### Test 4: Error Handling
1. Clear your OpenAI API key from options
2. Try to get an explanation
3. Verify that:
   - An error message appears
   - The error mentions configuring the API key
   - A hint to go to options is shown

### Test 5: Multiple Explanations
1. Request an explanation
2. Edit the query text inline
3. Verify that:
   - The query can be edited
   - Pressing Enter triggers a new explanation
   - The retry button works

## Expected Behavior

- Explanations should be in the same language as the query
- Markdown formatting should be rendered correctly
- Loading states should be clear
- Errors should be user-friendly
- The "Save" button should allow saving explanations as notes

## Troubleshooting

### "OpenAI API key not configured"
- Go to Options and configure your API key

### "Failed to retrieve from knowledge base"
- Check that InKCre API URL is correct
- Verify that you have blocks in your knowledge base
- Check browser console for detailed errors

### No explanation generated
- Check browser console for errors
- Verify your OpenAI API key is valid
- Check network requests in DevTools

## Developer Notes

For debugging, open the browser DevTools:
1. Right-click the extension sidepanel
2. Select "Inspect"
3. Check the Console tab for logs about:
   - Agent initialization
   - Tool executions
   - API calls
   - Errors
