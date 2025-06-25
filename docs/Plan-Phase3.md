# *Phase 3: Parameter-Driven Architecture Implementation*

**Status:** PLANNING - Strategic rewrite of JavaScript event handling and state management while preserving HTML structure, CSS, and database schema.

**Goal:** Build a scalable, parameter-driven foundation that handles the three core operations (appState updates, database sync, render coordination) through configurable actions rather than hardcoded handlers.

**Constraints:** 
- Vanilla JavaScript only (no frameworks/libraries)
- Preserve existing HTML structure and `data-action` patterns
- Maintain working app functionality throughout migration
- Support future feature development with 5-10x faster implementation

---

## **[ ] Epic 3.1 - Core State Management Foundation**

**Why first:** All other systems depend on clean state management. Current appState has mutation issues and competing systems that need to be resolved before building event handling.

- [ ] **Build immutable state container**
  - [ ] Create `AppState` class with immutable update methods
  - [ ] Implement deep object merging for nested updates
  - [ ] Add state path utilities (`getAtPath`, `setAtPath`, `updateAtPath`)
  - [ ] Create state subscription system for change notifications
  - [ ] Add state validation and type checking
  - [ ] Implement state history tracking (foundation for future undo/redo)

- [ ] **Design unified state structure**
  - [ ] Define `resources` section (components, componentTypes, promptSets, visibility)
  - [ ] Define `workspace` section (activeProject, projectLibrary)
  - [ ] Define `ui` section (activeTab, panelStates, adminDetails)
  - [ ] Create state migration utilities from current appState
  - [ ] Add state serialization/deserialization for persistence

- [ ] **Resolve competing prompt set systems**
  - [ ] Analyze current template system vs visibility system conflict
  - [ ] Design single source of truth for component visibility
  - [ ] Create migration path from dual systems to unified system
  - [ ] Test unified system against all current use cases

---

## **[ ] Epic 3.2 - Parameter-Driven Action System**

**Why second:** Once state management is solid, we can build the configurable action system that will handle most interactions through JSON configuration rather than custom handlers.

- [ ] **Create action configuration system**
  - [ ] Design JSON schema for action configurations
  - [ ] Build action executor that reads configurations
  - [ ] Create parameter interpolation system (e.g., `{componentId}`, `{blockId}`)
  - [ ] Add conditional logic support for actions
  - [ ] Implement action composition (multiple operations per action)

- [ ] **Build core action types**
  - [ ] `UPDATE_STATE`: Path-based state updates with validation
  - [ ] `SAVE_TO_DB`: Database operations with endpoint/method/data config
  - [ ] `RENDER_TARGETS`: Selective re-rendering with target specification
  - [ ] `SYNC_TABS`: Cross-tab coordination with sync rules
  - [ ] `CSS_TOGGLE`: Simple UI state changes
  - [ ] `NAVIGATE`: Tab switching and URL updates

- [ ] **Create action middleware pipeline**
  - [ ] Database sync middleware (handles `saveToDb` parameter)
  - [ ] Render coordination middleware (handles `renderTargets` parameter)
  - [ ] Tab sync middleware (handles `syncTabs` parameter)
  - [ ] Validation middleware (ensures data integrity)
  - [ ] Logging middleware (for debugging and analytics)
  - [ ] Error handling middleware (rollback on failures)

---

## **[ ] Epic 3.3 - Smart Event Management System**

**Why third:** With state and actions working, we can build the event system that bridges HTML interactions to parameter-driven actions.

- [ ] **Build declarative event manager**
  - [ ] Create `EventManager` class with delegation-based handling
  - [ ] Implement automatic `data-action` attribute detection
  - [ ] Add support for event type specification (click, change, input, blur)
  - [ ] Create data extraction utilities from DOM elements
  - [ ] Build target element context detection

- [ ] **Create hybrid action routing**
  - [ ] Route simple actions through JSON configuration
  - [ ] Route complex actions to custom handler functions
  - [ ] Build action classification system (simple vs complex)
  - [ ] Create fallback mechanisms for unhandled actions
  - [ ] Add action performance monitoring

- [ ] **Implement context-aware data extraction**
  - [ ] Build data extractors for common patterns:
    - [ ] Content block identification from textarea IDs
    - [ ] Component IDs from `data-component-id` attributes
    - [ ] Draft context from parent `data-content-block` elements
    - [ ] Tab targets from `data-tab-target` attributes
  - [ ] Create generic data extraction configuration system
  - [ ] Add validation for extracted data

---

## **[ ] Epic 3.4 - Intelligent Render Coordination**

**Why fourth:** With events and state working, we need smart rendering that only updates what actually changed, eliminating the infinite loop issues.

- [ ] **Build render target system**
  - [ ] Create render target registry (map targets to DOM elements/functions)
  - [ ] Implement selective rendering based on state changes
  - [ ] Add render dependency tracking (what state changes affect which UI)
  - [ ] Create render batching to prevent multiple updates per frame
  - [ ] Build render performance monitoring

- [ ] **Implement state diffing**
  - [ ] Create state comparison utilities for detecting changes
  - [ ] Build change detection for nested objects and arrays
  - [ ] Implement render scheduling based on change types
  - [ ] Add render optimization (skip unchanged elements)
  - [ ] Create render debugging tools

- [ ] **Fix infinite loop prevention**
  - [ ] Implement render guards to prevent cascading updates
  - [ ] Add DOM mutation detection to avoid rebuild loops
  - [ ] Create render cycle detection and breaking
  - [ ] Build safe rendering contexts for admin panel
  - [ ] Add render error recovery mechanisms

---

## **[ ] Epic 3.5 - Database Sync Coordination**

**Why fifth:** Database operations need to be coordinated with state and rendering without blocking the UI or causing conflicts.

- [ ] **Build async database sync**
  - [ ] Create database operation queue with retry logic
  - [ ] Implement optimistic updates with rollback on failure
  - [ ] Add database operation batching for performance
  - [ ] Build conflict resolution for concurrent updates
  - [ ] Create database sync status tracking

- [ ] **Implement database action patterns**
  - [ ] Create reusable patterns for CRUD operations
  - [ ] Build endpoint configuration system (URL templates, methods, headers)
  - [ ] Add request/response transformation utilities
  - [ ] Implement error handling and user feedback
  - [ ] Create database operation logging

- [ ] **Add cross-tab database coordination**
  - [ ] Implement database change detection across tabs
  - [ ] Build tab synchronization triggers
  - [ ] Create conflict resolution for multi-tab editing
  - [ ] Add database change broadcasting between tabs
  - [ ] Implement tab-specific database caching

---

## **[ ] Epic 3.6 - Migration of Simple Interactions**

**Why sixth:** Start migration with the simplest patterns to validate the new system works before tackling complex interactions.

- [ ] **Migrate basic UI interactions**
  - [ ] Convert `togglePanel` actions to parameter-driven
  - [ ] Migrate `switchTab` with new tab coordination
  - [ ] Update `projectTitleInput` to use new state paths
  - [ ] Convert theme switching to CSS toggle actions
  - [ ] Migrate sidebar collapse/expand functionality

- [ ] **Configure simple state updates**
  - [ ] Create JSON configurations for input → state mappings
  - [ ] Set up render targets for each simple action
  - [ ] Add database sync rules where needed
  - [ ] Test parameter flexibility (add/remove database saves, renders)
  - [ ] Validate that simple parameter changes work as expected

- [ ] **Test new system integration**
  - [ ] Verify no regressions in basic functionality
  - [ ] Test parameter modification scenarios
  - [ ] Validate performance improvements
  - [ ] Check error handling and recovery
  - [ ] Ensure debugging capabilities work

---

## **[ ] Epic 3.7 - Draft System Implementation**

**Why seventh:** The draft system is complex but self-contained, making it a good test of the new architecture for complex domain logic.

- [ ] **Build draft management system**
  - [ ] Create `DraftManager` class for each content block
  - [ ] Implement draft CRUD operations (create, read, update, delete)
  - [ ] Add draft ID generation and timestamp management
  - [ ] Build active draft tracking and switching
  - [ ] Create draft validation and error handling

- [ ] **Integrate draft system with new architecture**
  - [ ] Configure draft actions through parameter system where possible
  - [ ] Use custom handlers for complex draft logic
  - [ ] Set up proper render targets for draft UI updates
  - [ ] Add database persistence for draft data (if needed)
  - [ ] Implement draft synchronization across content blocks

- [ ] **Complete draft UI functionality**
  - [ ] Fix draft dropdown population and selection
  - [ ] Implement draft save/delete button states
  - [ ] Add draft timestamp display and formatting
  - [ ] Create draft limit management (prevent too many drafts)
  - [ ] Build draft export/import functionality

---

## **[ ] Epic 3.8 - Admin Panel Reconstruction**

**Why eighth:** The admin panel has the most complex interactions and the infinite loop issues, so we tackle it after validating the new system with simpler patterns.

- [ ] **Fix admin panel infinite loops**
  - [ ] Implement `onBlur` database saves instead of real-time updates
  - [ ] Add tab-based sync coordination for admin → workspace updates
  - [ ] Create safe DOM rebuilding that doesn't trigger new events
  - [ ] Build admin panel render isolation to prevent cascading updates
  - [ ] Add admin panel state validation and error recovery

- [ ] **Migrate admin panel interactions**
  - [ ] Convert `componentActiveToggle` to parameter-driven action
  - [ ] Migrate `componentRename` with proper database sync
  - [ ] Update `componentGroupCheckbox` with visibility coordination
  - [ ] Convert admin input fields to new event system
  - [ ] Implement `toggleAdminDetails` with new UI state management

- [ ] **Build admin-workspace coordination**
  - [ ] Create sync rules for admin changes affecting workspace
  - [ ] Implement workspace updates when switching from admin tab
  - [ ] Add conflict detection for simultaneous admin/workspace changes
  - [ ] Build admin change preview before applying to workspace
  - [ ] Create admin change history and rollback capabilities

---

## **[ ] Epic 3.9 - Component Composition System**

**Why ninth:** Component composition is complex but currently working, so we migrate it carefully to preserve functionality while improving maintainability.

- [ ] **Migrate component builder interactions**
  - [ ] Convert `addComponent`/`removeComponent` to parameter-driven
  - [ ] Update `componentSelect` dropdown handling
  - [ ] Migrate `componentInput` textarea management
  - [ ] Fix `assembleAll` complex business logic integration
  - [ ] Update component visibility coordination

- [ ] **Implement component state management**
  - [ ] Build component state synchronization between builder and admin
  - [ ] Create component template system integration
  - [ ] Add component validation and error handling
  - [ ] Implement component dependency tracking
  - [ ] Build component preset and template management

- [ ] **Complete component workflow**
  - [ ] Fix prompt set switching with component visibility
  - [ ] Implement component ordering and prioritization
  - [ ] Add component grouping and categorization
  - [ ] Create component search and filtering
  - [ ] Build component usage analytics and optimization

---

## **[ ] Epic 3.10 - Legacy Code Cleanup and Optimization**

**Why last:** Once all functionality is migrated to the new system, we can safely remove old code and optimize performance.

- [ ] **Remove legacy JavaScript**
  - [ ] Delete old event handler functions
  - [ ] Remove deprecated state management code
  - [ ] Clean up unused utility functions
  - [ ] Remove old render functions and global render calls
  - [ ] Delete legacy action mapping arrays

- [ ] **Optimize new system performance**
  - [ ] Profile action execution times and optimize bottlenecks
  - [ ] Implement render batching and throttling
  - [ ] Add intelligent caching for frequently accessed state
  - [ ] Optimize database operation batching
  - [ ] Build performance monitoring dashboard

- [ ] **Add developer experience improvements**
  - [ ] Create action debugging tools and state inspector
  - [ ] Build parameter configuration validation
  - [ ] Add comprehensive error messages and debugging info
  - [ ] Create development mode with additional logging
  - [ ] Build automated testing framework for new architecture

---

## **CRITICAL SUCCESS CRITERIA**

1. **Parameter Flexibility Validation:**
   - Can easily add database save to any action by changing one parameter
   - Can modify render targets without touching handler code
   - Can add cross-tab sync by updating configuration

2. **Performance Improvements:**
   - No infinite loops in admin panel
   - Faster rendering with selective updates
   - Smooth user experience with async database operations

3. **Future Feature Readiness:**
   - New features can be added primarily through configuration
   - Complex features require minimal custom code
   - Development velocity increases 5-10x for common operations

4. **Maintainability:**
   - Clear separation between configuration and business logic
   - Easy debugging with action logs and state inspection
   - Predictable behavior with immutable state management

---

## **RISK MITIGATION**

- **Incremental migration:** Each epic can be tested independently
- **Rollback capability:** Keep old system working until migration complete
- **Feature flags:** Enable/disable new system per interaction type
- **Comprehensive testing:** Validate each migrated pattern thoroughly
- **User feedback:** Monitor for regressions and performance issues 