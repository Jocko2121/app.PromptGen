# Project Plan: Phase 4

## **Notes**
- This phase focuses on fixing the core Database Components functionality - the heart of the snippet organization tool
- Priority is making database read/write operations and cross-tab re-rendering work properly
- Secondary features (drafts, text transformer, etc.) are kept in appState and implemented later
- Delivers immediate value by making the primary user workflow functional

# *Phase 4: Database Components CRUD & Core Functionality*

**[ ] Epic 4.1 - Database Components Panel CRUD Operations**

- [x] **Task 1: Implement Text Field Database Updates** ✅
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

- [ ] **Task 3: Implement Component Rename Functionality**
  - [ ] Fix `handleComponentRename()` → rename to `handleComponentRenameBlur()` (onBlur event)
  - [ ] Add database API call: `PUT /api/component-types/:id` with `{ display_name: newName }`
  - [ ] Add simple user feedback: green border flash for success, red border + tooltip for errors
  - [ ] Update `builderComponentData` structure with new names
  - [ ] Re-render affected UI elements (Prompt Builder headers, admin panel)
  - [ ] Handle rename conflicts and validation
  - [ ] Test component type renaming across all tabs

- [ ] **Task 4: Fix Cross-Tab Re-rendering**
  - [ ] Implement surgical re-rendering for prompt_value changes (update specific textarea if component selected)
  - [ ] Implement dropdown refresh for selection name changes (rebuild dropdown options, preserve selections)
  - [ ] Implement header updates for component renames (update display names throughout Prompt Builder)
  - [ ] Verify existing Prompt Set Visibility system handles component type visibility (no changes needed)
  - [ ] Avoid full page re-render - use targeted DOM updates only
  - [ ] Test that Database Components changes immediately appear in Prompt Builder without page refresh

- [ ] **Task 5: Implement Refresh All Functionality**
  - [ ] Change "Save All" button to "Refresh All" (admin/development tool)
  - [ ] Implement fresh data reload from database to appState cache
  - [ ] Re-render Database Components admin panel with fresh data
  - [ ] Update Prompt Builder dropdowns and components with refreshed data
  - [ ] Add visual feedback during refresh operation (brief loading indication)
  - [ ] Test that refresh resolves any cache/database inconsistencies

- [ ] **Task 6: Implement Individual Prompt Active/Inactive Checkboxes**
  - [ ] Implement `handleComponentActiveToggle()` function to save `is_active` state to database
  - [ ] Add API call to update component: `PUT /user-components/:id` with `{ is_active: boolean }`
  - [ ] Update appState cache after successful database save
  - [ ] Trigger cross-tab re-rendering when active/inactive state changes
  - [ ] Filter Prompt Builder dropdowns to only show active prompts (is_active = true)
  - [ ] Add user feedback: brief visual confirmation on successful toggle
  - [ ] Test that inactive prompts are hidden from Prompt Builder but still visible in Database Components admin

**[ ] Epic 4.2 - Dynamic Component Add/Remove System**

- [ ] **Task 1: Implement Add Component Type Functionality**
  - [ ] Fix `handleAddComponent()` to create new component types
  - [ ] Add UI for component type creation (name, default prompts, etc.)
  - [ ] Store new component types in database: `POST /api/component-types`
  - [ ] Update admin panel to show new component types
  - [ ] Refresh Prompt Builder to include new types
  - [ ] Test creating and using new component types

- [ ] **Task 2: Implement Remove Component Type Functionality**
  - [ ] Fix `handleRemoveComponent()` to delete component types
  - [ ] Add confirmation dialog for component type deletion
  - [ ] Remove from database: `DELETE /api/component-types/:id`
  - [ ] Clean up related components and references
  - [ ] Update both admin panel and Prompt Builder
  - [ ] Test component type removal and cleanup

- [ ] **Task 3: Dynamic Component UI Management**
  - [ ] Add "Create New Component Type" button to admin panel
  - [ ] Implement component type creation modal/form
  - [ ] Add component type deletion buttons with confirmations
  - [ ] Update component tables dynamically without full re-render
  - [ ] Handle component type ordering and organization
  - [ ] Test complete add/remove workflow

**[ ] Epic 4.3 - Database API Enhancements**

- [ ] **Task 1: Component CRUD API Endpoints**
  - [ ] Implement `PUT /api/components/:id` for component updates
  - [ ] Implement `PUT /api/component-types/:id` for type updates
  - [ ] Implement `POST /api/component-types` for new type creation
  - [ ] Implement `DELETE /api/component-types/:id` for type deletion
  - [ ] Add proper error handling and validation
  - [ ] Test all CRUD operations via API

- [ ] **Task 2: Batch Operations API**
  - [ ] Implement `PUT /api/components/batch` for bulk updates
  - [ ] Add transaction support for batch operations
  - [ ] Implement rollback mechanisms for failed batch operations
  - [ ] Add progress tracking for large batch operations
  - [ ] Test batch save functionality with multiple changes

- [ ] **Task 3: Database Consistency and Validation**
  - [ ] Add database constraints and validation rules
  - [ ] Implement data integrity checks for component relationships
  - [ ] Add duplicate prevention for component types and selections
  - [ ] Implement proper foreign key handling for deletions
  - [ ] Test data consistency across all operations

**[ ] Epic 4.4 - User Experience Improvements**

- [ ] **Task 1: Real-time Feedback and Error Handling**
  - [ ] Add loading indicators for database operations
  - [ ] Implement success/error notifications for all saves
  - [ ] Add form validation and input sanitization
  - [ ] Implement optimistic UI updates with rollback on failure
  - [ ] Add keyboard shortcuts for common operations
  - [ ] Test user feedback across all database operations

- [ ] **Task 2: Performance Optimization**
  - [ ] Add debouncing for text input auto-save
  - [ ] Implement intelligent caching for database reads
  - [ ] Optimize re-rendering to only update changed elements
  - [ ] Add lazy loading for large component lists
  - [ ] Implement efficient diff algorithms for UI updates
  - [ ] Test performance with large numbers of components

- [ ] **Task 3: Data Import/Export and Backup**
  - [ ] Enhance existing export functionality for components
  - [ ] Add import functionality for component data
  - [ ] Implement component backup and restore features
  - [ ] Add component versioning and history tracking
  - [ ] Create component sharing and template features
  - [ ] Test data portability and backup/restore workflows

**[ ] Epic 4.5 - Secondary Feature Implementation (AppState-Based)**

- [ ] **Task 1: Draft System Implementation**
  - [ ] Implement `handleDraftSave()` - save content to appState drafts
  - [ ] Implement `handleDraftDelete()` - remove drafts from appState
  - [ ] Implement `handleDraftSelect()` - load drafts into textareas
  - [ ] Add draft data structures to appState for all content blocks
  - [ ] Populate draft dropdowns from appState
  - [ ] Test draft functionality across all content areas

- [ ] **Task 2: Text Transformer Implementation**
  - [ ] Implement `handleTextTransformerAction()` - set transformation type
  - [ ] Implement `handleTextTransformerOption()` - set transformation options
  - [ ] Implement `handleTextTransformExecute()` - process text transformations
  - [ ] Implement `handleTextCopyUp()` - copy results between areas
  - [ ] Store transformer state in appState
  - [ ] Test text transformation workflows

- [ ] **Task 3: Content Management Features**
  - [ ] Implement `handleInsertOutline()` - insert outline into final prompt
  - [ ] Implement `handleCopyToClipboard()` - copy with proper formatting
  - [ ] Implement `handleClearContent()` - clear with confirmation and draft save
  - [ ] Add content validation and formatting features
  - [ ] Test content management workflow integration

## **Implementation Strategy**

### **Phase 4A: Core Database Functionality (Epics 4.1-4.2)**
- **Weeks 1-3**: Fix Database Components CRUD operations
- **Weeks 4-5**: Implement dynamic component add/remove
- **Goal**: Make the core snippet organization functionality work completely
- **Success Metric**: Users can edit, save, and organize prompt components effectively

### **Phase 4B: System Robustness (Epics 4.3-4.4)**  
- **Weeks 6-7**: Enhance database API and add batch operations
- **Weeks 8-9**: Improve user experience and performance
- **Goal**: Make the system production-ready and user-friendly
- **Success Metric**: System handles complex workflows reliably and efficiently

### **Phase 4C: Feature Completion (Epic 4.5)**
- **Weeks 10-11**: Implement secondary features (drafts, text transformer, etc.)
- **Goal**: Complete the full feature set for comprehensive prompt management
- **Success Metric**: All planned features work seamlessly together

## **Success Criteria**

**Core Functionality Goals:**
- [ ] Users can edit prompt values and selections in Database Components panel
- [ ] All changes save to database immediately with proper error handling
- [ ] Changes in Database Components instantly appear in Prompt Builder
- [ ] Users can add and remove component types dynamically
- [ ] Component renaming works across all tabs and interfaces

**Technical Goals:**
- [ ] Zero data loss during editing operations
- [ ] Sub-second response time for all database operations
- [ ] Proper error handling and user feedback for all operations
- [ ] Clean separation between database operations and UI updates
- [ ] Surgical re-rendering without full page refreshes

**User Experience Goals:**
- [ ] Intuitive editing workflow in Database Components panel
- [ ] Clear feedback for all save operations and errors
- [ ] Seamless integration between Database Components and Prompt Builder
- [ ] Efficient bulk editing and batch save capabilities
- [ ] Reliable undo/redo and draft management

## **Risk Mitigation**

**High Risk Areas:**
- Database write operations - Implement comprehensive error handling and validation
- Cross-tab synchronization - Test thoroughly to prevent UI inconsistencies
- Component deletion - Add proper cleanup and confirmation dialogs
- Batch operations - Implement transaction support and rollback mechanisms

**Mitigation Strategies:**
- Incremental implementation with testing after each task
- Database backup before implementing write operations
- Comprehensive error logging and user feedback
- Rollback mechanisms for failed operations
- Extensive testing of edge cases and error conditions

## **Dependencies**

**Prerequisites:**
- Phase 3 completion (render system elimination)
- Working database read operations
- Stable project management system
- Current Database Components panel UI structure

**External Dependencies:**
- Database API endpoints (to be implemented)
- No additional libraries required
- Compatible with existing event system
- Works with current appState structure

## **Timeline Estimates**

**Epic 4.1:** 3 weeks (Database Components CRUD)
**Epic 4.2:** 2 weeks (Dynamic component add/remove)  
**Epic 4.3:** 2 weeks (Database API enhancements)
**Epic 4.4:** 2 weeks (User experience improvements)
**Epic 4.5:** 2 weeks (Secondary features)

**Total Phase 4:** 11 weeks

**Note:** Refresh All functionality serves as valuable admin/development tool for resolving cache inconsistencies and testing database changes during development.

## **Technical Implementation Notes**

### **Event Handling Strategy by Input Type:**

**Use onBlur for:**
- ✅ **Text inputs** (single-line text, textareas) - user edits content, moves away, saves
- ✅ **Editable content fields** - prompt values, selection names, component type names
- ✅ **Rename operations** - any text field where user is editing existing content

**Use onChange/onClick for:**
- ✅ **Checkboxes and toggles** - prompt set visibility toggles, component group checkboxes
- ✅ **Dropdowns that change UI state** - draft selection, transformer actions
- ✅ **Radio buttons** - immediate selection feedback expected
- ✅ **Action buttons** - Refresh All, Delete, Create, Copy, Clear, Transform
- ✅ **Navigation controls** - tab switches, panel toggles

**Use onSubmit for:**
- ✅ **Modal forms** - component type creation, bulk operations
- ✅ **Multi-field creation forms** - when multiple fields should be saved together

### **Cross-Tab Re-rendering Requirements:**

**Database changes that REQUIRE Prompt Builder re-rendering:**
- ✅ **Text field updates (prompt_value)** - update textarea if that component is currently selected
- ✅ **Selection field updates (selection names)** - refresh dropdowns with new options, update selected textarea if affected
- ✅ **Component renames (display_name)** - update component headers and labels throughout Prompt Builder
- ✅ **Prompt Set Visibility changes** - show/hide entire component types in Prompt Builder (existing system)

**Database changes that DON'T require immediate cross-tab re-rendering:**
- ❌ **Add/remove component types** - admin operations, user expects to refresh manually
- ❌ **Draft operations** - workspace-specific, no cross-tab impact
- ❌ **Refresh All operations** - explicit user action to reload everything from database

### **Key Implementation Principles:**
- **Simple API calls** using existing `PUT /api/components/:id` endpoint pattern
- **Instant feedback** appropriate for local Node.js environment (brief success flash, persistent error indication)
- **appState cache updates** to maintain UI consistency after database saves
- **Surgical cross-tab synchronization** - only re-render affected Prompt Builder elements, not full page refresh
- **Error state management** with automatic clearing when user resumes editing

## **Important Context & Lessons Learned**

- **Database Components panel is the core of the snippet organization tool** - everything else is secondary
- **onBlur saves are simpler and more predictable** - users understand "edit → move away → save" workflow
- **Local Node.js app = instant saves** - no need for loading spinners or complex progress indicators
- **Cross-tab synchronization prevents user confusion** - changes must appear everywhere immediately
- **Dynamic component management is a key differentiator** - enables true snippet organization
- **Simple user feedback is sufficient** - brief green flash for success, red border + tooltip for errors
- **Surgical re-rendering is more reliable than full refreshes** - maintains user context and focus
- **AppState-based features can be implemented later** - focus on database functionality first
- **Error handling and validation are non-negotiable** - data integrity is paramount
- **Simplicity wins over complexity** - onBlur approach eliminates debouncing, race conditions, and performance overhead 