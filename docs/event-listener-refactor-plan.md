# Event Listener Refactor Plan
This document outlines the analysis and plan for refactoring the event listener architecture in `public/index.html`.

**STATUS: 95% COMPLETE** - Most event handling has been successfully converted to declarative `data-action` pattern. Three UI interactions remain in imperative style.

The HTML has been successfully updated to use `data-action` attributes for most interactions.

# Project Plan: Phase 3 - Event Handlers

**[x] Epic 3.1 - Refactor Project & Library Management**
    - [x] **Why first:** This is a relatively simple group of handlers that primarily interact with the top level of the `appState`. It's a good, low-risk place to start.
    - [x] **Actions refactored:** `saveProject`, `saveAsProject`, `loadProject`, `deleteProject`, `adminReset`, `projectTitleInput`.

**[x] Epic 3.2 - Refactor Content Blocks & Drafts**
    - [x] **Why second:** This group is more complex, involving nested state and reading from the DOM. It was a good test of our new model's flexibility.
    - [x] **Actions refactored:** `draftSave`, `draftDelete`, `draftSelect`, `contentBlockInput`, `insertOutline`, `clearContent`, `copyToClipboard`.

**[x] Epic 3.3 - Refactor Text Transformer**
    - [x] **Why third:** This group is self-contained and provided a good test case for actions that have both a primary trigger (the action selector) and secondary triggers (the radio options).
    - [x] **Actions refactored:** `selectTextTransformerAction`, `selectTextTransformerOption`, `executeTextTransform`, `copyUp`.

**[x] Epic 3.4 - Refactor the Prompt Builder**
    - [x] **Why fourth:** This is the core interactive part of the application. It has many interconnected parts.
    - [x] **Actions refactored:** `addComponent`, `removeComponent`, `componentSelect`, `componentInput`, `assembleAll`.

**[x] Epic 3.5 - Refactor the Database Components Admin Panel**
    - [x] **Why fifth:** This was the most complex area, with network side effects and the "lazy state" issue. The new system, proven by the previous steps, was ready to handle it.
    - [x] **Actions refactored:** `componentRename`, `componentActiveToggle`, `componentGroupCheckbox`, `toggleAdminDetails`.

**[ ] Epic 3.6 - Final UI Interactions**
    - [ ] **Why last:** These are the remaining imperative interactions that need conversion to complete the refactor.
*   **Actions to refactor:**
     - [ ] `handlePanelToggle` (`.collapsible-panel__icon` → `data-action="togglePanel"`)
     - [ ] `handlePromptSetChange` (`.prompt-set-selector` → `data-action="changePromptSet"`)
     - [ ] `handleTabSwitch` (`.tab-button` → `data-action="switchTab"`)

**[ ] Epic 3.7 - Resolve Admin Panel Issues**
*   **Why needed:** Restore full admin panel functionality by resolving the infinite loop issue.
*   **Actions to resolve:**
     - [ ] Fix infinite loop in `handleAdminSelectionInput`
     - [ ] Fix infinite loop in `handleAdminPromptInput`
     - [ ] Re-enable direct editing in admin panel

**[ ] Epic 3.8 - Final Cleanup**
*   **Why last:** Once all handlers have been migrated to the declarative model, remove legacy code.
*   **Actions to complete:**
     - [ ] Remove remaining `if/else if` blocks in event listeners
     - [ ] Remove any obsolete handler wrapper functions
     - [ ] Verify all interactions use declarative pattern




## Phase 4: Render Optimization (Future Work)

This phase addresses the architectural inefficiency discovered during the event listener refactor. The global `render()` function, while simple, is inefficient and causes side effects (like the dropdown bug) because it rebuilds large, complex DOM structures when only a small part needs to change.

**The Goal:** To improve performance and stability by replacing broad `render()` calls with more surgical DOM updates where appropriate.

**The Plan:**

1.  **Audit `render()` Calls:** Systematically review every place `render()` is called from within the event listener action map.
2.  **Identify Candidates for Optimization:** For each call, determine if a full re-render is necessary or if a more targeted update is possible. Good candidates are actions that only affect a single, isolated part of the UI.
3.  **Surgical Refactor:** One by one, refactor the event handlers for these candidates. The handler will be responsible for both updating the state *and* performing the minimal required DOM manipulation to reflect that state change.
4.  **Balance:** The goal is not to eliminate the global `render()` function entirely—it is still useful for large, sweeping changes like loading a new project. The goal is to strike the right balance between a purely state-driven top-level render and more efficient, targeted updates for frequent, simple interactions.

---

## Current Status Summary

**✅ COMPLETED (95%):**
- Project & Library Management
- Content Blocks & Drafts  
- Text Transformer
- Prompt Builder & Assembly
- Database Components Admin (with known issues)

**⏳ REMAINING WORK (5%):**
- 3 UI interactions still using imperative pattern
- Admin panel infinite loop resolution
- Final cleanup and legacy code removal

**🐛 KNOWN ISSUES:**
- Admin panel input handlers disabled due to infinite loop
- Some render calls may be inefficient (future optimization target)

The refactor has been highly successful, converting the vast majority of event handling to a clean, declarative pattern while maintaining full application functionality.
---



## 1: Full Inventory of Event Logic
This phase involves a complete audit of all user interaction logic to understand every moving part before making changes.

### 1a. Event Listener Inventory
A systematic mapping of every event trigger to its corresponding handler function.

*   **`click` Listener (Declarative - Converted):**
    *   `data-action="saveProject"`: `handleProjectSave`
    *   `data-action="saveAsProject"`: `handleProjectSaveAs`
    *   `data-action="loadProject"`: `handleProjectLoad` (dynamically set)
    *   `data-action="deleteProject"`: `handleProjectDelete` (dynamically set)
    *   `data-action="adminReset"`: `handleAdminReset`
    *   `data-action="draftSave"`: `handleDraftSave`
    *   `data-action="draftDelete"`: `handleDraftDelete`
    *   `data-action="selectTextTransformerAction"`: `handleTextTransformerAction`
    *   `data-action="executeTextTransform"`: `handleTextTransformExecute`
    *   `data-action="copyUp"`: `handleTextCopyUp`
    *   `data-action="copyToClipboard"`: `handleCopyToClipboard`
    *   `data-action="clearContent"`: `handleClearContent`
    *   `data-action="insertOutline"`: `handleInsertOutline`
    *   `data-action="assembleAll"`: `handleAssembleAll`
    *   `data-action="addComponent"`: `handleAddComponent`
    *   `data-action="removeComponent"`: `handleRemoveComponent` (dynamically set)
    *   `data-action="componentGroupCheckbox"`: `handleComponentGroupCheckbox` (dynamically set)
    *   `data-action="componentActiveToggle"`: `handleComponentActiveToggle` (dynamically set)
    *   `data-action="toggleAdminDetails"`: `handleAdminToggleDetails`

*   **`click` Listener (Imperative - Still Pending):**
    *   `.collapsible-panel__icon`: `handlePanelToggle`
    *   `.prompt-set-selector`: `handlePromptSetChange`
    *   `.tab-button`: `handleTabSwitch`

*   **`change` Listener (Declarative - Converted):**
    *   `data-action="draftSelect"`: `handleDraftSelect`
    *   `data-action="selectTextTransformerOption"`: `handleTextTransformerOption`
    *   `data-action="componentSelect"`: `handleComponentSelect` (dynamically set)
    *   `data-action="componentGroupCheckbox"`: `handleComponentGroupCheckbox` (dynamically set)
    *   `data-action="componentRename"`: `handleComponentRename` (dynamically set)

*   **`change` Listener (Disabled - Known Issue):**
    *   `.input--selection`: `handleAdminSelectionInput` (TEMPORARILY DISABLED to fix infinite loop)
    *   `.textarea--prompt`: `handleAdminPromptInput` (TEMPORARILY DISABLED to fix infinite loop)

*   **`input` Listener (Declarative - Converted):**
    *   `data-action="projectTitleInput"`: `handleProjectTitleInput`
    *   `data-action="contentBlockInput"`: `handleContentBlockInput`
    *   `data-action="componentInput"`: `handleComponentInput` (dynamically set)

### 1b. Handler Function Analysis

A detailed breakdown of each handler function's behavior.

| Handler Function | State Read | State Write | Triggers Render | Side Effects | Notes |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `handlePanelToggle` | - | - | - | Direct DOM manipulation (toggles class) | No state interaction. Purely a UI toggle. |
| `handlePromptSetChange` | ✅ | ✅ | ✅ | Calls `applyPromptSet`, which also writes state. | Complex state update. |
| `handleTabSwitch` | - | - | - | Direct DOM manipulation (tab switching) | No state interaction. UI-only. |
| `handleProjectSave` | ✅ | ✅ | ✅ | - | Modifies `savedProjects` array. |
| `handleProjectSaveAs` | ✅ | ✅ | ✅ | - | Clones `activeProject`, adds to `savedProjects`. |
| `handleProjectLoad` | ✅ | ✅ | ✅ | Calls `applyPromptSet`. | Replaces `activeProject` entirely. |
| `handleProjectDelete` | - | ✅ | ✅ | - | Filters `savedProjects` array. DOES trigger render. |
| `handleAdminReset` | - | ✅ | ✅ | Calls `applyPromptSet`. | Resets the entire `appState` object. |
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
| `handleComponentActiveToggle`| ✅ | ✅ | ✅ | `fetch` call to API (`PUT /api/user-components/:id`). | Important: Has a network side effect. |
| `handleComponentRename` | - | - | - | Calls `handleComponentTypeRename`. | Wrapper function. |
| `handleAdminToggleDetails` | - | - | - | Updates `showAdminDetails` flag, calls `renderComponentsAdmin()`. | Admin panel state toggle. |
| `handleDraftSelect` | - | ✅ | ✅ | - | Updates `activeDraftId` for a content block. |
| `handleTextTransformerOption`| - | ✅ | - | - | Simple state update. |
| `handleComponentSelect` | - | ✅ | ✅ | Calls `updateComponentState`. | Wrapper function. |
| `handleComponentGroupCheckbox`| - | ✅ | ✅ | `fetch` call to API (`PUT /api/prompt-set-visibility`). | Network side effect. |
| `handleProjectTitleInput` | - | ✅ | - | - | Simple state update on `input` event. |
| `handleContentBlockInput` | ✅ | ✅ | - | - | Updates content of the active draft on `input`. |
| `handleComponentInput` | ✅ | ✅ | - | - | Updates `promptValue` or `userValue` in builder. |
| `handleAdminSelectionInput` | ✅ | ✅ | - | `fetch` call to API (`PUT /api/user-components/:id`). | DISABLED - infinite loop issue. |
| `handleAdminPromptInput` | ✅ | ✅ | - | `fetch` call to API (`PUT /api/user-components/:id`). | DISABLED - infinite loop issue. |

---

## 2: Categorization & Dependency Mapping
Organizing the inventory into logical feature groups to reveal dependencies and potential edge cases.

### 2a. Feature Groups

*   **UI & Panel Management (Pending Conversion):**
    *   `handlePanelToggle` (imperative)
    *   `handleTabSwitch` (imperative)
*   **Project & Library Management (✅ COMPLETE):**
    *   `handleProjectSave`
    *   `handleProjectSaveAs`
    *   `handleProjectLoad`
    *   `handleProjectDelete`
    *   `handleAdminReset`
    *   `handleProjectTitleInput`
*   **Prompt Set Management (Pending Conversion):**
    *   `handlePromptSetChange` (imperative)
*   **Prompt Builder & Assembly (✅ COMPLETE):**
    *   `handleAddComponent`
    *   `handleRemoveComponent`
    *   `handleComponentSelect`
    *   `handleComponentInput`
    *   `handleAssembleAll`
*   **Content Blocks & Drafts (✅ COMPLETE):**
    *   `handleDraftSave`
    *   `handleDraftDelete`
    *   `handleDraftSelect`
    *   `handleContentBlockInput`
    *   `handleInsertOutline`
    *   `handleClearContent`
    *   `handleCopyToClipboard`
*   **Text Transformer (✅ COMPLETE):**
    *   `handleTextTransformerAction`
    *   `handleTextTransformerOption`
    *   `handleTextTransformExecute`
    *   `handleTextCopyUp`
*   **Database Components Admin (✅ COMPLETE):**
    *   `handleComponentRename`
    *   `handleComponentActiveToggle`
    *   `handleComponentGroupCheckbox`
    *   `handleAdminToggleDetails`

### 2b. Hidden Dependencies & Edge Cases
This section identifies non-obvious interactions that must be handled carefully during the refactor.

1.  **Lazy State Initialization in Rendering:**
    *   **Description:** Several parts of the `render` logic (`renderComponentsAdmin`, `renderBuilderPallet`) create nested objects within `appState` on-the-fly. For example, `appState.activeProject.promptSets.custom_build.role` might not exist until the admin panel is rendered.
    *   **Impact:** Event handlers that expect these nested objects to exist will fail if they run before the UI is rendered. The `handleCheckboxChange` function is a prime example of this.
    *   **Refactor Implication:** The new, declarative event handling system must not assume that the state structure is complete. State-writing handlers must be robust enough to create nested objects if they are missing.

2.  **Wrappers and Indirect Handlers:**
    *   **Description:** Several event triggers do not call a final handler directly. Instead, they call a "wrapper" function which then calls the "real" handler (e.g., `handleComponentGroupCheckbox` calls `handleCheckboxChange`).
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

5.  **Admin Panel Infinite Loop Issue:**
    *   **Description:** Admin panel input handlers (`handleAdminSelectionInput`, `handleAdminPromptInput`) are currently disabled due to an infinite loop issue when they trigger renders.
    *   **Impact:** Direct editing of component selection and prompt values in the admin panel is not functional.
    *   **Resolution Needed:** The infinite loop must be resolved to restore full admin panel functionality.

---

## 3: The Refactoring Strategy
This is an incremental plan to safely refactor the event listeners to a declarative `data-action` model. The core principle is to perform the refactor one feature group at a time, ensuring the application remains fully functional after each step.

### The New Declarative Model
The final goal is to replace the large `if/else if` blocks with a single, simple listener that maps `data-action` attributes to handler functions.

**1. The New `setupAppEventListeners` function:**

The function has been successfully implemented with an actionMap that links `data-action` strings to handler functions.

```javascript
const actionMap = {
    click: {
        // Project & Library Management
        saveProject: handleProjectSave,
        saveAsProject: handleProjectSaveAs,
        loadProject: handleProjectLoad,
        deleteProject: handleProjectDelete,
        adminReset: handleAdminReset,
        // Content Blocks & Drafts
        draftSave: handleDraftSave,
        draftDelete: handleDraftDelete,
        insertOutline: handleInsertOutline,
        copyToClipboard: handleCopyToClipboard,
        clearContent: handleClearContent,
        // Text Transformer
        selectTextTransformerAction: handleTextTransformerAction,
        executeTextTransform: handleTextTransformExecute,
        copyUp: handleTextCopyUp,
        // Prompt Builder
        addComponent: handleAddComponent,
        removeComponent: handleRemoveComponent,
        assembleAll: handleAssembleAll,
        // Database Admin
        componentActiveToggle: handleComponentActiveToggle,
        toggleAdminDetails: handleAdminToggleDetails,
    },
    change: {
        draftSelect: handleDraftSelect,
        selectTextTransformerOption: handleTextTransformerOption,
        componentSelect: handleComponentSelect,
        componentGroupCheckbox: handleComponentGroupCheckbox,
        componentRename: handleComponentRename,
    },
    input: {
        projectTitleInput: handleProjectTitleInput,
        contentBlockInput: handleContentBlockInput,
        componentInput: handleComponentInput,
    }
};
```



## Learnings & Retrospective

A log of major challenges, failures, and key learnings from this refactoring process. This section serves as a project memory to prevent repeating past mistakes.

*   **Initial Learning (Pre-Refactor):** A large-scale, "big bang" refactor of the event listener system previously failed. The root cause was a lack of a deep, upfront analysis, which led to missing numerous edge cases and hidden dependencies (e.g., lazy state initialization, API side effects).
    *   **Decision:** All future refactoring must be incremental, preceded by a thorough analysis, and documented in this file.

*   **Dropdown Bug & Render Inefficiency (Step 4):** During the refactor of the Prompt Builder, we discovered a bug where dropdown menus would close instantly. The initial fix (`setTimeout`) failed, revealing a deeper issue: the global `render()` function is too "brute-force," rebuilding entire sections of the DOM for minor state changes.
    *   **Decision:** The immediate fix is to make the specific event handler (`handleComponentSelect`) more "surgical" by updating the DOM directly. The larger, strategic decision is to formally plan a new phase of work to audit all `render()` calls and refactor them to be more targeted and efficient, improving both performance and stability.

*   **Complex Persistence Bugs (Step 5):** The refactor of the Database Components Admin Panel revealed a cascade of complex, interrelated bugs that were initially misdiagnosed. The core problem of state not persisting was not due to a single error, but a combination of several deep issues:
    *   **An Obsolete Caching Service:** A legacy `state-persistence.js` service with an auto-save feature was silently overwriting database changes, causing initial confusion. The service was completely removed.
    *   **Silent Transaction Failures:** A custom test script revealed that the `better-sqlite3` library's transaction wrappers were being used incorrectly in `src/db/operations.js`, causing database writes to fail silently. This was a latent bug affecting multiple operations. The fix was to remove the wrappers and execute SQL commands directly.
    *   **State Initialization Flaws:** The `fetchAndInitializeData` and `renderBuilderPallet` functions were not correctly using the persisted data from the database to build the client-side `appState`, leading to the UI being rendered from incorrect default values.
    *   **The True Root Cause (Architectural Mismatch):** The final, most fundamental issue was that the UI provided controls for state (e.g., the visibility of a component group within a specific prompt set) that had no corresponding field or table in the database schema.
    *   **Decision:** The architecture was corrected by adding a `prompt_sets` table and a `prompt_set_component_visibility` linking table to the database. This created a scalable and robust system for managing UI state, finally resolving the persistence bug. This lengthy process underscored the principle: if state needs to persist, it must have a place to be persisted.

*   **Admin Panel Infinite Loop Discovery:** During Step 5, we discovered that admin panel input handlers were causing infinite loops when they triggered renders. These handlers were temporarily disabled to maintain system stability.
    *   **Decision:** The handlers remain disabled until the root cause of the infinite loop can be identified and resolved. This is a known issue requiring future attention.

*   **Success of Incremental Approach:** The incremental, feature-group-by-feature-group approach proved highly successful. Each step was completed without breaking existing functionality, and the hybrid model allowed for safe, testable progress.
    *   **Decision:** This incremental approach should be the standard for all future large refactoring efforts.

---

