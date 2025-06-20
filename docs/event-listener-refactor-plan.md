# Event Listener Refactor Plan

This document outlines the analysis and plan for refactoring the event listener architecture in `public/index.html`.

---
## Working Agreement

1.  **Approval:** The AI assistant will not write or modify any code without explicit user approval.
2.  **Clarification:** If the user asks a question or makes a comment after a proposal has been made, the assistant will answer the question and then *must* ask for approval again before proceeding to code. Answering a question does not imply approval to code.
3.  **Proposal:** Before seeking approval, the assistant will provide a concise summary of the proposed changes, including which files will be modified.
---

## Phase 1: Full Inventory of Event Logic

This phase involves a complete audit of all user interaction logic to understand every moving part before making changes.

### 1a. Event Listener Inventory

A systematic mapping of every event trigger to its corresponding handler function.

*   **`click` Listener:**
    *   `.collapsible-panel__icon`: `handlePanelToggle`
    *   `.prompt-set-selector`: `handlePromptSetChange`
    *   `#save-project-button`: `handleProjectSave`
    *   `#save-as-project-button`: `handleProjectSaveAs`
    *   `#library-list li` (and not `.sidebar__project-delete-button`): `handleProjectLoad`
    *   `.sidebar__project-delete-button`: `handleProjectDelete`
    *   `#admin-reset-button`: `handleAdminReset`
    *   `.draft-controls__button--save`: `handleDraftSave`
    *   `.draft-controls__button--delete`: `handleDraftDelete`
    *   `.text-transformer__action-selector`: `handleTextTransformerAction`
    *   `#transform-execute-button`: `handleTextTransformExecute`
    *   `[data-action="copy-up"]`: `handleTextCopyUp`
    *   `#copy-button`: `handleCopyToClipboard`
    *   `#clear-button`: `handleClearContent`
    *   `#insert-button`: `handleInsertOutline`
    *   `#assemble-all-button`: `handleAssembleAll`
    *   `#add-component-button`: `handleAddComponent`
    *   `.component__remove-button`: `handleRemoveComponent`
    *   `.component-group__prompt-set-checkbox`: `handleComponentGroupCheckbox`
    *   `.component-active-checkbox`: `handleComponentActiveToggle`
    *   `.group-title__editable-text`: `handleComponentRename` (Note: also in `change` listener)

*   **`change` Listener:**
    *   `.draft-controls__select`: `handleDraftSelect`
    *   `#text-transformer-options-container` (radio button): `handleTextTransformerOption`
    *   `.prompt-builder__component select`: `handleComponentSelect`
    *   `.component-group__prompt-set-checkbox`: `handleComponentGroupCheckbox`
    *   `.group-title__editable-text`: `handleComponentRename`

*   **`input` Listener:**
    *   `#project-title-input`: `handleProjectTitleInput`
    *   `[id$="-textarea"]` (in specific panels): `handleContentBlockInput`
    *   `textarea` (in `.prompt-builder__component`): `handleComponentInput`

### 1b. Handler Function Analysis

A detailed breakdown of each handler function's behavior.

| Handler Function | State Read | State Write | Triggers Render | Side Effects | Notes |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `handlePanelToggle` | - | - | - | Direct DOM manipulation (toggles class) | No state interaction. Purely a UI toggle. |
| `handlePromptSetChange` | ✅ | ✅ | ✅ | Calls `applyPromptSet`, which also writes state. | Complex state update. |
| `handleProjectSave` | ✅ | ✅ | ✅ | - | Modifies `savedProjects` array. |
| `handleProjectSaveAs` | ✅ | ✅ | ✅ | - | Clones `activeProject`, adds to `savedProjects`. |
| `handleProjectLoad` | ✅ | ✅ | ✅ | Calls `applyPromptSet`. | Replaces `activeProject` entirely. |
| `handleProjectDelete` | - | ✅ | - | - | Filters `savedProjects` array. Does not re-render. |
| `handleAdminReset` | - | ✅ | - | Calls `applyPromptSet`. | Resets the entire `appState` object. |
| `handleDraftSave` | ✅ | ✅ | - | Reads from DOM (`textarea.value`). | Pushes a new draft object to an array. |
| `handleDraftDelete` | ✅ | ✅ | - | - | Filters a `drafts` array. |
| `handleTextTransformerAction`| - | ✅ | - | - | Simple state update. |
| `handleTextTransformExecute`| ✅ | ✅ | - | - | Reads from one state block to write to another. |
| `handleTextCopyUp` | ✅ | ✅ | - | - | Reads from one state block to write to another. |
| `handleCopyToClipboard` | - | - | - | Uses `navigator.clipboard`, direct DOM manipulation (button text). | No state interaction. |
| `handleClearContent` | ✅ | ✅ | - | - | Clears content of the active draft. |
| `handleInsertOutline` | ✅ | ✅ | - | - | Combines content from two state blocks. |
| `handleAssembleAll` | ✅ | ✅ | - | - | Complex: reads from many builder states to write to one. |
| `handleAddComponent` | ✅ | ✅ | - | - | Finds first inactive component and activates it. |
| `handleRemoveComponent` | - | ✅ | - | - | Sets a builder component to inactive. |
| `handleComponentCheckbox` | - | ✅ | ✅ | Calls `handleCheckboxChange`. | Wrapper function. |
| `handleComponentActiveToggle`| ✅ | ✅ | ✅ | `fetch` call to API (`PUT /api/user-components/:id`). | Important: Has a network side effect. |
| `handleComponentRename` | - | - | - | Calls `handleComponentTypeRename`. | Wrapper function. |
| `handleDraftSelect` | - | ✅ | ✅ | - | Updates `activeDraftId` for a content block. |
| `handleTextTransformerOption`| - | ✅ | - | - | Simple state update. |
| `handleComponentSelect` | - | ✅ | ✅ | Calls `updateComponentState`. | Wrapper function. |
| `handleComponentGroupCheckbox`| - | ✅ | ✅ | Calls `handleCheckboxChange`. | Wrapper function. |
| `handleProjectTitleInput` | - | ✅ | - | - | Simple state update on `input` event. |
| `handleContentBlockInput` | ✅ | ✅ | - | - | Updates content of the active draft on `input`. |
| `handleComponentInput` | ✅ | ✅ | - | - | Updates `promptValue` or `userValue` in builder. |

---

## Phase 2: Categorization & Dependency Mapping

Organizing the inventory into logical feature groups to reveal dependencies and potential edge cases.

### 2a. Feature Groups

*   **UI & Panel Management:**
    *   `handlePanelToggle`
*   **Project & Library Management:**
    *   `handleProjectSave`
    *   `handleProjectSaveAs`
    *   `handleProjectLoad`
    *   `handleProjectDelete`
    *   `handleAdminReset`
    *   `handleProjectTitleInput`
*   **Prompt Set Management:**
    *   `handlePromptSetChange`
*   **Prompt Builder & Assembly:**
    *   `handleAddComponent`
    *   `handleRemoveComponent`
    *   `handleComponentSelect`
    *   `handleComponentInput`
    *   `handleAssembleAll`
*   **Content Blocks & Drafts:**
    *   `handleDraftSave`
    *   `handleDraftDelete`
    *   `handleDraftSelect`
    *   `handleContentBlockInput`
    *   `handleInsertOutline`
    *   `handleClearContent`
    *   `handleCopyToClipboard`
*   **Text Transformer:**
    *   `handleTextTransformerAction`
    *   `handleTextTransformerOption`
    *   `handleTextTransformExecute`
    *   `handleTextCopyUp`
*   **Database Components Admin:**
    *   `handleComponentRename`
    *   `handleComponentActiveToggle`
    *   `handleComponentGroupCheckbox` (wrapper for `handleCheckboxChange`)

### 2b. Hidden Dependencies & Edge Cases

This section identifies non-obvious interactions that must be handled carefully during the refactor.

1.  **Lazy State Initialization in Rendering:**
    *   **Description:** Several parts of the `render` logic (`initializeComponentsAdmin`, `renderBuilderPallet`) create nested objects within `appState` on-the-fly. For example, `appState.activeProject.promptSets.custom_build.role` might not exist until the admin panel is rendered.
    *   **Impact:** Event handlers that expect these nested objects to exist will fail if they run before the UI is rendered. The `handleCheckboxChange` function is a prime example of this.
    *   **Refactor Implication:** The new, declarative event handling system must not assume that the state structure is complete. State-writing handlers must be robust enough to create nested objects if they are missing.

2.  **Wrappers and Indirect Handlers:**
    *   **Description:** Several event triggers do not call a final handler directly. Instead, they call a "wrapper" function which then calls the "real" handler (e.g., `.component-group__prompt-set-checkbox` calls `handleComponentGroupCheckbox`, which then calls `handleCheckboxChange`).
    *   **Impact:** A simple mapping from a `data-action` attribute to a function name might be insufficient. The mapping will need to account for these intermediate wrapper functions.
    *   **Refactor Implication:** The `data-action` value in the HTML might need to call the wrapper, or the main listener will need a more sophisticated way to resolve the final target function.

3.  **Complex State Dependencies:**
    *   **Description:** Some handlers have complex dependencies on the state. `applyPromptSet` is called by `handlePromptSetChange` and `handleProjectLoad`, and it deeply modifies the `builder` state based on a template. `updateComponentState` is another example.
    *   **Impact:** These functions are central to the application's logic. Simply mapping them to a `data-action` is not enough; we must ensure the context (`target` element) and necessary parameters are passed correctly.
    *   **Refactor Implication:** The design of the new listener must be flexible enough to accommodate functions that require more than just a simple state update. It will need to handle passing specific data from the clicked element to the handler function.

4.  **DOM-Reliant Handlers:**
    *   **Description:** A few handlers read directly from the DOM (e.g., `handleDraftSave` reads `textarea.value`) or write directly to it (`handleCopyToClipboard` changes button text).
    *   **Impact:** These break the pure "state-driven" model. While sometimes necessary, they need to be clearly identified.
    *   **Refactor Implication:** The new declarative system should still be able to support these actions, but we should be mindful of them and consider if they can be moved to a more state-centric approach where possible.

---

## Phase 3: The Refactoring Strategy

This is an incremental plan to safely refactor the event listeners to a declarative `data-action` model. The core principle is to perform the refactor one feature group at a time, ensuring the application remains fully functional after each step.

### The New Declarative Model

The final goal is to replace the large `if/else if` blocks with a single, simple listener that maps `data-action` attributes to handler functions.

**1. The New `setupAppEventListeners` function:**

The function will be drastically simplified. We will create a mapping object (e.g., `actionMap`) that links a `data-action` string to its handler function.

```javascript
const actionMap = {
    // To be populated incrementally
    saveProject: handleProjectSave,
    saveAsProject: handleProjectSaveAs,
    // ...etc
};

const appContainer = document.querySelector('.app-container');

appContainer.addEventListener('click', e => {
    const target = e.target.closest('[data-action]');
    if (target && actionMap[target.dataset.action]) {
        actionMap[target.dataset.action](target, e); // Pass target and event for context
        render(); // Optional: decide if a render is needed
    }
});

// Similar listeners for 'change' and 'input' events...
```

**2. Corresponding HTML Changes:**

The HTML will be updated to use `data-action` attributes instead of complex IDs and classes for triggering events.

```html
<!-- Before -->
<button id="save-project-button" class="button--utility">Save</button>

<!-- After -->
<button data-action="saveProject" class="button--utility">Save</button>
```

### The Incremental Plan

We will refactor the code in the following order, testing after each step.

**Step 1: Refactor Project & Library Management** (`COMPLETE`)
*   **Why first:** This is a relatively simple group of handlers that primarily interact with the top level of the `appState`. It's a good, low-risk place to start.
*   **Actions to refactor:** `saveProject`, `saveAsProject`, `loadProject`, `deleteProject`, `adminReset`, `projectTitleInput`.

**Step 2: Refactor Content Blocks & Drafts** (`COMPLETE`)
*   **Why second:** This group is more complex, involving nested state and reading from the DOM. It will be a good test of our new model's flexibility.
*   **Actions to refactor:** `draftSave`, `draftDelete`, `draftSelect`, `contentBlockInput`, etc.

**Step 3: Refactor Text Transformer** (`COMPLETE`)
*   **Why third:** This group is also self-contained and provides a good test case for actions that have both a primary trigger (the action selector) and secondary triggers (the radio options).
*   **Actions to refactor:** `selectTextTransformerAction`, `selectTextTransformerOption`, `executeTextTransform`, `copyUp`.

**Step 4: Refactor the Prompt Builder** (`COMPLETE`)
*   **Why fourth:** This is the core interactive part of the application. It has many interconnected parts.
*   **Actions to refactor:** `addComponent`, `removeComponent`, `componentSelect`, `componentInput`, `assembleAll`.

**Step 5: Refactor the Database Components Admin Panel** (`PENDING`)
*   **Why last:** This is the most complex area, with network side effects and the "lazy state" issue. Our new system, proven by the previous steps, will be ready to handle it.
*   **Actions to refactor:** `componentRename`, `componentActiveToggle`, `componentGroupCheckbox`.

**Step 6: Final Cleanup**
*   Once all handlers have been migrated to the declarative model, we will remove the old `if/else if` blocks and any now-obsolete handler wrapper functions.

This incremental plan ensures that we can safely and methodically achieve our refactoring goals without breaking the application, learning from the experience of the past attempt.

---

## Learnings & Retrospective

A log of major challenges, failures, and key learnings from this refactoring process. This section serves as a project memory to prevent repeating past mistakes.

*   **Initial Learning (Pre-Refactor):** A large-scale, "big bang" refactor of the event listener system previously failed. The root cause was a lack of a deep, upfront analysis, which led to missing numerous edge cases and hidden dependencies (e.g., lazy state initialization, API side effects).
    *   **Decision:** All future refactoring must be incremental, preceded by a thorough analysis, and documented in this file.

*   **Dropdown Bug & Render Inefficiency (Step 4):** During the refactor of the Prompt Builder, we discovered a bug where dropdown menus would close instantly. The initial fix (`setTimeout`) failed, revealing a deeper issue: the global `render()` function is too "brute-force," rebuilding entire sections of the DOM for minor state changes.
    *   **Decision:** The immediate fix is to make the specific event handler (`handleComponentSelect`) more "surgical" by updating the DOM directly. The larger, strategic decision is to formally plan a new phase of work to audit all `render()` calls and refactor them to be more targeted and efficient, improving both performance and stability.

---
## Phase 4: Render Optimization (Future Work)

This phase addresses the architectural inefficiency discovered during the event listener refactor. The global `render()` function, while simple, is inefficient and causes side effects (like the dropdown bug) because it rebuilds large, complex DOM structures when only a small part needs to change.

**The Goal:** To improve performance and stability by replacing broad `render()` calls with more surgical DOM updates where appropriate.

**The Plan:**

1.  **Audit `render()` Calls:** Systematically review every place `render()` is called from within the event listener action map.
2.  **Identify Candidates for Optimization:** For each call, determine if a full re-render is necessary or if a more targeted update is possible. Good candidates are actions that only affect a single, isolated part of the UI.
3.  **Surgical Refactor:** One by one, refactor the event handlers for these candidates. The handler will be responsible for both updating the state *and* performing the minimal required DOM manipulation to reflect that state change.
4.  **Balance:** The goal is not to eliminate the global `render()` function entirely—it is still useful for large, sweeping changes like loading a new project. The goal is to strike the right balance between a purely state-driven top-level render and more efficient, targeted updates for frequent, simple interactions.

*   *(...to be populated as we proceed...)* 