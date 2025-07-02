# Project Plan: Phase 4

## Working Agreement
- **Approval:** 
  - Critical - The AI assistant will not write or modify any code without explicit user approval.
- **Clarification:** 
  - If the user asks a question or makes a comment after a proposal has been made, the assistant will answer the question and then *must* ask for approval again before proceeding to code. Answering a question does not imply approval to code.
- **Proposal:**
  - Before seeking approval, the assistant will provide a concise summary of the proposed changes, including which files will be modified.
- **Server**: 
  - The user will start and stop the server. You will request they do that on any code change that requires a server restart.
- **Task Completion**: 
  - Upon completion of a code change or task the assistant will provide a concise summary of the completed changes, including which files were modified and write out a clear UI test procedure (if necessary) for the user to follow.

## **Notes**
- This phase focuses on fixing the core Database Components functionality - the heart of the snippet organization tool
- Priority is making database read/write operations and cross-tab re-rendering work properly
- Secondary features (drafts, text transformer, etc.) are kept in appState and implemented later
- Delivers immediate value by making the primary user workflow functional

# *Phase 4: Database Components CRUD & Core Functionality*

**[x] Epic 4.1 - Database Components Panel CRUD Operations** - COMPLETE

- [x] **Task 1: Implement Text Field Database Updates**
  - [x] Change event listener from `input` to `blur` for textarea saves
  - [x] Fix `handleComponentInput()` → implemented onBlur auto-save functionality
  - [x] Add database API call: `PUT /api/user-components/:id` with `{ prompt_value: newValue }`
  - [x] Add simple user feedback: green border flash (200ms) for success, red border + tooltip for errors
  - [x] Update appState cache after successful database save
  - [x] Clear error states when user starts typing again
  - [x] Test prompt value editing and persistence across page reloads

- [x] **Task 2: Implement Selection Field Database Updates**
  - [x] Create `handleAdminSelectionBlur()` handler for selection text inputs (onBlur event)
  - [x] Add to blur event routing with action `adminSelectionBlur`
  - [x] Save selection field changes: `PUT /api/user-components/:id` with `{ selection: newValue }`
  - [x] Add simple user feedback: toast notifications for success/error messages
  - [x] Update appState cache and re-populate Prompt Builder dropdowns
  - [x] Add `data-action="adminSelectionBlur"` to selection inputs in `renderDatabaseComponentsAdmin()`
  - [x] Test selection editing and dropdown synchronization

- [x] **Task 3: Implement Component Rename Functionality**
  - [x] Enhanced `handleComponentRename()` with blur event handling (async function)
  - [x] Database API call: `PUT /api/component-types/:typeKey` with `{ displayName: newName }`
  - [x] User feedback with toast notifications for success/error messages
  - [x] Update appState cache via `updateComponentTypeCache()` function
  - [x] Update `builderComponentData` structure via `updateBuilderComponentData()` function
  - [x] Cross-tab synchronization with Prompt Builder (follows established pattern)
  - [x] Validation for empty component type names with error feedback
  - [x] Added to `handleInputEvents()` routing system
  - [x] Test component type renaming across all tabs - PASSED

- [x] **Task 4: Fix Cross-Tab Re-rendering**
  - [x] Implement surgical re-rendering for prompt_value changes (update specific textarea if component selected)
  - [x] Implement dropdown refresh for selection name changes (rebuild dropdown options, preserve selections)
  - [x] Implement header updates for component renames (update display names throughout Prompt Builder)
  - [x] Verify existing Prompt Set Visibility system handles component type visibility (no changes needed)
  - [x] Avoid full page re-render - use targeted DOM updates only
  - [x] Test that Database Components changes immediately appear in Prompt Builder without page refresh

- [x] **Task 5: Implement Refresh All Functionality** (Simple Implementation)
  - [x] Change "Save All" button to "Refresh All" (admin/development tool)
  - [x] Implement fresh data reload from database to appState cache
  - [x] Re-render Database Components admin panel with fresh data
  - [x] Update Prompt Builder dropdowns and components with refreshed data
  - [x] Add visual feedback with toast notification 
  - [x] Simple 20-line implementation as debugging tool 

- [x] **Task 6: Implement Individual Prompt Active/Inactive Checkboxes**
  - [x] Implement `handleComponentActiveToggle()` function to save `is_active` state to database
  - [x] Add API call to update component: `PUT /user-components/:id` with `{ is_active: boolean }`
  - [x] Update appState cache after successful database save
  - [x] Trigger cross-tab re-rendering when active/inactive state changes
  - [x] Filter Prompt Builder dropdowns to only show active prompts (is_active = true)
  - [x] Add user feedback: brief visual confirmation on successful toggle
  - [x] Test that inactive prompts are hidden from Prompt Builder but still visible in Database Components admin

**[x] Epic 4.2 - Prompt Set Management & Visibility System** - COMPLETE

- [x] **Task 1: Implement Left Rail Prompt Set Switching** ✅ COMPLETE
  - [x] Fix `handlePromptSetChange()` to save active prompt set to database
  - [x] Add to main click event routing system with action `changePromptSet`
  - [x] Database integration: save active prompt set in project settings via `PUT /api/project-settings`
  - [x] Update Prompt Builder header to show active prompt set name (replace `[set_name] ⏳`)
  - [x] Update appState cache and left rail active visual states
  - [x] Add cross-tab synchronization when prompt set changes
  - [x] Test prompt set switching with visual feedback and persistence
  - [x] Strategic API hardcoding to Project ID=1 for rapid development (multi-project support deferred)

- [x] **Task 2: Implement Prompt Set Visibility Database Updates** ✅ COMPLETE
  - [x] Fix `handleComponentGroupCheckbox()` to save visibility state to database
  - [x] Add to admin change event routing system with action `componentGroupCheckbox`
  - [x] Database API call: `PUT /api/prompt-set-visibility` with `{ promptSetId, componentTypeId, isVisible }`
  - [x] Update appState cache after successful database save
  - [x] Add toast notifications for success/error feedback
  - [x] Update status text ("Visible"/"Hidden") immediately after save
  - [x] Add surgical cross-tab synchronization for visibility changes
  - [x] Test visibility checkbox toggling and persistence across page reloads

- [x] **Task 3: Implement Prompt Builder Component Filtering** ✅ COMPLETE
  - [x] Filter Prompt Builder components based on active prompt set visibility rules
  - [x] Modified Prompt Builder initialization to use `getVisibleComponentTypes()` filtering
  - [x] Add `getVisibleComponentTypes()` helper function using appState cache
  - [x] Update Prompt Builder initialization to respect prompt set visibility
  - [x] Handle edge case where no components are visible for active prompt set (shows helpful message)
  - [x] Enhanced cross-tab sync: visibility changes instantly add/remove components from Prompt Builder
  - [x] Enhanced cross-tab sync: prompt set changes rebuild Prompt Builder with new visibility rules
  - [x] Test that changing prompt sets shows/hides appropriate components

- [x] **Task 4: Implement Cross-Tab Synchronization for Prompt Sets** ✅ COMPLETE
  - [x] Add surgical update functions for prompt set changes
  - [x] Implement `updatePromptBuilderForPromptSetChange()` - rebuild visible components
  - [x] Implement `updatePromptSetVisibilityStatus()` - update status text and checkboxes
  - [x] Enhance `triggerCrossTabRerender()` with prompt set update types
  - [x] Add prompt set header updates across all tabs
  - [x] Test cross-tab sync: changes in Database Components immediately affect Prompt Builder
  - [x] Test cross-tab sync: left rail prompt set switching updates Database Components checkboxes





**[ ] Epic 4.3 - Content Workspace Implementation**

- [ ] **Task 1: Draft System Implementation**
  - [ ] Implement `handleDraftSave()` - save content to appState drafts for User Outline, Final Prompt, and Article Workspace
  - [ ] Implement `handleDraftDelete()` - remove drafts from appState with confirmation
  - [ ] Implement `handleDraftSelect()` - load saved drafts into textareas with smooth transitions
  - [ ] Add draft data structures to appState for all content blocks (userOutline, finalPrompt, articleWorkspace)
  - [ ] Populate draft dropdowns from appState and update UI when drafts change
  - [ ] Add draft naming and organization (auto-generated names with timestamps)
  - [ ] Test draft functionality: save, load, delete, and persistence across page reloads

- [ ] **Task 2: Content Management Features**
  - [ ] Implement `handleInsertOutline()` - insert User Outline content into Final Prompt with formatting
  - [ ] Implement `handleCopyToClipboard()` - copy Final Prompt or Article Workspace content with proper formatting
  - [ ] Implement `handleClearContent()` - clear content areas with confirmation and automatic draft save
  - [ ] Add content validation and character count displays for textareas
  - [ ] Implement content auto-save to drafts (every 30 seconds when content exists)
  - [ ] Test complete content workflow: outline → insert → prompt → refine → copy

- [ ] **Task 3: Cross-Tab Content Synchronization**
  - [ ] Implement content change detection and appState updates
  - [ ] Add cross-tab synchronization for draft changes (when drafts are saved/deleted/selected)
  - [ ] Ensure content areas maintain state when switching between tabs
  - [ ] Add visual indicators for unsaved content changes
  - [ ] Test cross-tab content synchronization and state persistence

**[ ] Epic 4.4 - Text Transformer Implementation**

- [ ] **Task 1: Transformer Action System**
  - [ ] Implement `handleTextTransformerAction()` - set transformation type (summarize, expand, rewrite, analyze)
  - [ ] Implement `handleTextTransformerOption()` - set transformation options (length, tone, style)
  - [ ] Store transformer state in appState and persist selections
  - [ ] Add UI feedback for selected transformation actions and options
  - [ ] Create transformation presets for common use cases
  - [ ] Test action selection and option configuration

- [ ] **Task 2: Text Processing Engine**
  - [ ] Implement `handleTextTransformExecute()` - process text transformations using simple string manipulation
  - [ ] Add text analysis functions: word count, reading time, complexity score
  - [ ] Implement basic text transformations: summarize (extract key sentences), expand (add transition words), rewrite (synonym replacement)
  - [ ] Add format transformations: bullet points, numbered lists, paragraph restructuring
  - [ ] Create result preview and comparison with original text
  - [ ] Test all transformation functions with various input types

- [ ] **Task 3: Transformer Workflow Integration**
  - [ ] Implement `handleTextCopyUp()` - copy transformation results between content areas
  - [ ] Add transformation history and undo/redo functionality
  - [ ] Integrate transformer with draft system (save transformation results as drafts)
  - [ ] Add batch processing for multiple content areas
  - [ ] Implement transformation templates and saved configurations
  - [ ] Test complete transformer workflow: select text → transform → preview → apply → save

**[ ] Epic 4.5 - Data Portability & Component Library**

- [ ] **Task 1: Component Export System**
  - [ ] Enhance existing export functionality to include all component data (prompts, selections, visibility settings)
  - [ ] Add export filtering: by component type, by prompt set, by active/inactive status
  - [ ] Implement multiple export formats: JSON (for backup), CSV (for spreadsheets), human-readable text
  - [ ] Add export validation and integrity checks
  - [ ] Create export templates for different use cases (backup, sharing, migration)
  - [ ] Test export functionality with various component configurations

- [ ] **Task 2: Component Import System**
  - [ ] Implement component import functionality from JSON and CSV files
  - [ ] Add import validation: duplicate detection, data format verification, component type matching
  - [ ] Implement import conflict resolution: merge, overwrite, or skip duplicates
  - [ ] Add import preview showing what will be changed before applying
  - [ ] Create import mapping for different component structures
  - [ ] Test import functionality with various file formats and edge cases

- [ ] **Task 3: Component Library Management**
  - [ ] Implement component backup and restore features using existing backup system
  - [ ] Add component versioning: track changes to component types and prompt sets
  - [ ] Create component sharing templates: export minimal sets for specific use cases
  - [ ] Add component validation and cleanup tools (remove unused selections, fix broken references)
  - [ ] Implement component library statistics and usage analytics
  - [ ] Test complete data portability workflow: export → modify → import → verify

## **Phase 4 Status: Epics 4.1-4.2 Complete ✅**

**Completed:** Database Components CRUD & Prompt Set Management (5 weeks)
**Remaining:** Content Workspace, Text Transformer, Data Portability (9 weeks estimated)

**Next Session:** Ready to start Epic 4.3 (Content Workspace Implementation) - all stub functions already exist in `public/index.html` marked as "REMOVAL CANDIDATE" but are actually planned for implementation.

## **Critical Implementation Details & Architectural Decisions**

### **Event Handling Strategy (Proven Patterns):**
- **onBlur for database saves:** Text inputs, editable fields, rename operations - users understand "edit → move away → save" workflow
- **onChange/onClick for immediate feedback:** Checkboxes, dropdowns, action buttons, navigation
- **onSubmit for forms:** Modal forms, multi-field creation forms

### **Cross-Tab Synchronization (Surgical Updates):**
**Database changes that REQUIRE Prompt Builder re-rendering:**
- **Text field updates (prompt_value)** - update specific textarea if that component is currently selected
- **Selection field updates (selection names)** - refresh dropdowns with new options, update selected textarea if affected  
- **Component renames (display_name)** - update component headers and labels throughout Prompt Builder
- **Prompt Set Visibility changes** - show/hide entire component types in Prompt Builder

**AppState changes (workspace-specific, no cross-tab impact):**
- **Draft operations** - save/load/delete drafts within content areas
- **Text transformer state** - transformation selections and results
- **Content management** - outline insertion, clipboard operations

**Implementation via `triggerCrossTabRerender()`:**
- **Surgical updates only** - update specific DOM elements, not full page refresh
- **Maintains user context** - preserves focus, scroll position, form state
- **Type-specific handlers** - prompt_value, selection, component_rename, active_state, visibility_change

### **Database Integration Patterns:**
- **API endpoints:** `PUT /api/user-components/:id`, `PUT /api/component-types/:typeKey`, `PUT /api/prompt-set-visibility`
- **Hardcoded Project ID=1** for rapid development (multi-project UI exists but all projects share data)
- **appState cache updates** after successful database saves to maintain UI consistency
- **Error handling** with automatic clearing when user resumes editing

### **Key Architectural Decisions:**
- **onBlur saves eliminate debouncing** - simpler than complex input throttling
- **Local Node.js = instant saves** - no loading spinners needed for database operations
- **Simple user feedback sufficient** - brief green flash for success, red border + tooltip for errors
- **Surgical re-rendering over full refreshes** - maintains user context and performance
- **AppState-based features for content workspace** - drafts, transformer state don't need database persistence
- **Database only for component data** - prompts, selections, visibility, active states that need persistence

### **Proven Implementation Functions:**
- `updateComponentCache()`, `updateComponentTypeCache()` - maintain appState consistency
- `triggerCrossTabRerender()` - surgical DOM updates for cross-tab sync
- `updatePromptBuilderTextarea()`, `updateComponentDropdownOptions()` - specific update functions
- `showSaveSuccess()`, `showSaveError()` - consistent user feedback patterns 