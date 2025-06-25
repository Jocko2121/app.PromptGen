# *Phase 3: Parameter-Driven Architecture Implementation*

**Status:** PLANNING - Strategic rewrite of JavaScript event handling and state management while preserving HTML structure, CSS, and database schema.

**Goal:** Build a scalable, parameter-driven foundation that handles the three core operations (appState updates, database sync, render coordination) through configurable actions rather than hardcoded handlers.

**Constraints:** 
- Vanilla JavaScript only (no frameworks/libraries)
- Preserve existing HTML structure and `data-action` patterns
- Maintain working app functionality throughout migration
- Support future feature development with 5-10x faster implementation

---

## **PHASE A: FOUNDATION RESTORATION** *(Get basic functionality working again)*

## **[ ] Epic 3.1 - Foundation Rewrite: Database-First Architecture**

**Why first:** The current database architecture is fundamentally misaligned with user workflows. This surgical rewrite preserves working elements while rebuilding the foundation with proper project-centric design.

- [ ] **Phase 1: Branch and Database Foundation**
  - [ ] Cut new GitHub branch for rewrite
  - [ ] Rewrite database initialization file to create new project-centric schema
  - [ ] Create `projects` table for top-level project containers
  - [ ] Design `component_blocks` table for project-specific prompt components  
  - [ ] Create `prompt_sets` table for project-specific configurations
  - [ ] Design `builder_config` table for project UI state and settings
  - [ ] Create `workspace_data` table for project content, drafts, and iterations
  - [ ] Maintain `migrations` table for version tracking

- [ ] **Phase 2: Code Preservation and Stripping**
  - [ ] Create backup.js file with current JavaScript for reference
  - [ ] Strip complex logic from HTML file while preserving basic functions
  - [ ] Maintain tab switching, toggles, and basic interactions
  - [ ] Preserve working `data-action` event listener patterns
  - [ ] Keep HTML structure and CSS intact

- [ ] **Phase 3: Core System Rebuild**
  - [ ] Rebuild appState carefully - only include state that needs to be stateful
  - [ ] Avoid current appState bloat and mutation issues
  - [ ] Implement basic project-centric database operations
  - [ ] Create project CRUD operations (create, copy, delete with CASCADE)
  - [ ] Add project switching and workspace loading
  - [ ] Implement copy-don't-share philosophy for project independence

- [ ] **Phase 4: Integration and Event Restoration**
  - [ ] Layer in database integration with simplified state
  - [ ] Rebuild basic selective rendering system (eliminate infinite loops)
  - [ ] Restore event handling patterns from backup.js
  - [ ] Integrate working event listeners with new architecture
  - [ ] Test that `data-action` patterns work with new foundation

---

## **[ ] Epic 3.2 - Database Integration & Basic Operations**

**Why second:** Need immediate database functionality to support the new foundation. Basic CRUD operations must work before building advanced features.

- [ ] **Build essential database operations**
  - [ ] Implement project creation, loading, switching
  - [ ] Create component_blocks CRUD (add, edit, delete components)
  - [ ] Implement prompt_sets management (visibility rules)
  - [ ] Add workspace_data persistence (content blocks, drafts)
  - [ ] Create builder_config save/load (UI state)

- [ ] **Add data transformation utilities**
  - [ ] Build project import from current structure
  - [ ] Create starter project with example data
  - [ ] Add project export/backup functionality
  - [ ] Implement data validation and error handling
  - [ ] Create database operation logging

- [ ] **Test database foundation**
  - [ ] Verify all CRUD operations work correctly
  - [ ] Test project isolation (changes don't affect other projects)
  - [ ] Validate CASCADE deletes work properly
  - [ ] Confirm project switching preserves state
  - [ ] Test error recovery and rollback scenarios

---

## **[ ] Epic 3.3 - Simple Interaction Restoration**

**Why third:** Validate the foundation works by restoring basic UI functionality. This epic focuses on getting existing interactions working again, not adding new features.

- [ ] **Restore basic UI interactions**
  - [ ] Fix tab switching with new state management
  - [ ] Restore panel toggles (sidebar, details panels)
  - [ ] Implement basic input handling (project title, settings)
  - [ ] Fix theme switching and UI state persistence
  - [ ] Restore component add/remove basic functionality

- [ ] **Test foundation integration**
  - [ ] Verify no infinite loops in basic interactions
  - [ ] Test state persistence across tab switches
  - [ ] Confirm database saves work for simple changes
  - [ ] Validate render updates work without cascading
  - [ ] Test error handling for common user actions

- [ ] **Validate architectural decisions**
  - [ ] Confirm simplified appState eliminates mutation issues
  - [ ] Test that project isolation actually works in practice
  - [ ] Verify event system integrates cleanly with new foundation
  - [ ] Validate performance improvements over current system
  - [ ] Document any architectural adjustments needed

---

## **PHASE B: ADVANCED FEATURES** *(Build parameter-driven enhancements)*

## **[ ] Epic 3.4 - Core State Management Refinement**

**Why fourth:** Now that basic functionality works, refine state management for the parameter-driven architecture. Focus on features that enable configuration-driven behavior.

- [ ] **Build immutable state container**
  - [ ] Create `AppState` class with immutable update methods
  - [ ] Implement deep object merging for nested updates
  - [ ] Add state path utilities (`getAtPath`, `setAtPath`, `updateAtPath`)
  - [ ] Create state subscription system for change notifications
  - [ ] Add state validation and type checking

- [ ] **Design unified state structure**
  - [ ] Define `resources` section (components, componentTypes, promptSets)
  - [ ] Define `workspace` section (activeProject, projectLibrary)
  - [ ] Define `ui` section (activeTab, panelStates, adminDetails)
  - [ ] Create state migration utilities from current appState
  - [ ] Add state serialization/deserialization for persistence

- [ ] **Add advanced state features**
  - [ ] Implement state history tracking (foundation for future undo/redo)
  - [ ] Create state diffing for change detection
  - [ ] Add state debugging and inspection tools
  - [ ] Build state performance monitoring
  - [ ] Create state validation rules and error recovery

---

## **[ ] Epic 3.5 - Parameter-Driven Action System**

**Why fifth:** With solid state management, build the configurable action system that enables JSON-driven behavior modification.

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

## **[ ] Epic 3.6 - Smart Event Management System**

**Why sixth:** Enhance the working event system with parameter-driven capabilities. Bridge HTML interactions to configurable actions.

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

## **[ ] Epic 3.7 - Intelligent Render Coordination**

**Why seventh:** Add advanced rendering features now that basic rendering works. Focus on performance and coordination improvements.

- [ ] **Build render target system**
  - [ ] Create render target registry (map targets to DOM elements/functions)
  - [ ] Implement selective rendering based on state changes
  - [ ] Add render dependency tracking (what state changes affect which UI)
  - [ ] Create render batching to prevent multiple updates per frame
  - [ ] Build render performance monitoring

- [ ] **Implement advanced state diffing**
  - [ ] Create state comparison utilities for detecting changes
  - [ ] Build change detection for nested objects and arrays
  - [ ] Implement render scheduling based on change types
  - [ ] Add render optimization (skip unchanged elements)
  - [ ] Create render debugging tools

- [ ] **Add advanced coordination features**
  - [ ] Add DOM mutation detection to avoid rebuild loops
  - [ ] Create render cycle detection and breaking
  - [ ] Add render error recovery mechanisms
  - [ ] Implement cross-tab render coordination
  - [ ] Build render analytics and optimization reporting

---

## **PHASE C: COMPLEX SYSTEM MIGRATION** *(Migrate remaining functionality)*

## **[ ] Epic 3.8 - Admin Panel Reconstruction**

**Why eighth:** Tackle the most complex interactions after validating the new architecture with simpler patterns.

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

## **[ ] Epic 3.9 - Component Composition & Draft Systems**

**Why ninth:** Migrate the remaining complex domain logic after the foundation and admin panel are solid.

- [ ] **Migrate component builder interactions**
  - [ ] Convert `addComponent`/`removeComponent` to parameter-driven
  - [ ] Update `componentSelect` dropdown handling
  - [ ] Migrate `componentInput` textarea management
  - [ ] Fix `assembleAll` complex business logic integration
  - [ ] Update component visibility coordination

- [ ] **Build draft management system**
  - [ ] Create `DraftManager` class for each content block
  - [ ] Implement draft CRUD operations (create, read, update, delete)
  - [ ] Add draft ID generation and timestamp management
  - [ ] Build active draft tracking and switching
  - [ ] Create draft validation and error handling

- [ ] **Complete integrated workflows**
  - [ ] Fix prompt set switching with component visibility
  - [ ] Implement component ordering and prioritization
  - [ ] Complete draft UI functionality (dropdowns, save/delete states)
  - [ ] Add component and draft synchronization
  - [ ] Build component usage analytics and optimization

---

## **[ ] Epic 3.10 - Legacy Code Cleanup and Optimization**

**Why last:** Once all functionality is migrated to the new system, safely remove old code and optimize performance.

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

1. **Foundation Validation (After Epic 3.3):**
   - App has basic functionality working again
   - No infinite loops in any interactions
   - Database operations work reliably
   - Project isolation is maintained

2. **Parameter Flexibility Validation (After Epic 3.6):**
   - Can easily add database save to any action by changing one parameter
   - Can modify render targets without touching handler code
   - Can add cross-tab sync by updating configuration

3. **Performance Improvements:**
   - Faster rendering with selective updates
   - Smooth user experience with async database operations
   - 5-10x faster development velocity for new features

4. **Maintainability:**
   - Clear separation between configuration and business logic
   - Easy debugging with action logs and state inspection
   - Predictable behavior with immutable state management

---

## **RISK MITIGATION**

- **Clear phase boundaries:** Can validate foundation before building advanced features
- **Incremental testing:** Each epic validates previous work before proceeding
- **Rollback capability:** Keep backup.js until all functionality is migrated
- **Working app throughout:** User can always switch back to previous version
- **Comprehensive validation:** Test each migrated pattern thoroughly before next epic 