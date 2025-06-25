# Architecture Analysis - Hypothesis Testing Cycles

## CYCLE 1-3 FINDINGS

### FAILED HYPOTHESES:
❌ **"Clean separation between workspace and database"** - Database data is stored directly in appState
❌ **"Unidirectional data flow"** - Render functions modify state during rendering  
❌ **"Admin panel as read-only library"** - Admin panel directly edits database cache

### DISCOVERED PATTERNS:
✅ **Hybrid appState**: Part workspace (builder, contentBlocks) + Part database cache (components, promptSets, visibility)
✅ **Three-way sync**: Database ↔ appState.components ↔ appState.builder
✅ **Optimistic updates**: UI first, database async, rollback on failure
✅ **Render side effects**: renderPromptSets() modifies appState.builder[].active

### CURRENT HYPOTHESIS (Cycle 4):
**"Optimistic CRUD with Workspace Extensions"**
- appState.components = database cache (CRUD operations)
- appState.builder = workspace layer (user composition)
- appState.contentBlocks = workspace layer (text manipulation)
- Visibility system controls builder ↔ components sync

## CYCLE 4 FINDINGS - PROMPT SET MECHANISMS

🚨 **CRITICAL DISCOVERY: TWO CONFLICTING PROMPT SET SYSTEMS**

**System 1: Template-based (applyPromptSet)**
```javascript
// applyPromptSet() overwrites builder state from promptSets templates
Object.assign(builderState[key], template[key]);
// Sets active/inactive based on saved template
```

**System 2: Visibility-based (renderPromptSets)**  
```javascript
// renderPromptSets() sets active based on visibility records
appState.activeProject.builder[key].active = visibilityRecord ? !!visibilityRecord.is_visible : false;
```

**THE CONFLICT:**
- `handlePromptSetChange()` calls `applyPromptSet()` then `render()`
- `render()` calls `renderPromptSets()` which OVERWRITES what `applyPromptSet()` just set!
- Two different systems trying to control the same state

**HYPOTHESIS UPDATE:**
❌ **"Single prompt set mechanism"** - There are actually TWO competing systems
✅ **"Dual prompt set systems"** - Template system vs Visibility system

## CYCLE 5 FINDINGS - WHICH SYSTEM WINS

✅ **VISIBILITY SYSTEM ALWAYS WINS**
Execution order: `applyPromptSet()` → `render()` → `renderPromptSets()` (overwrites)
- Template system sets builder state first
- Visibility system overwrites it during render
- **Template system is effectively DEAD CODE** for active/inactive states

## CYCLE 6 FINDINGS - GLOBAL DATA STRUCTURES

✅ **TRIPLE DATA STRUCTURE PATTERN**
```javascript
// 1. Database cache (in appState)
appState.activeProject.components = [{ id: 1, type_key: 'role', selection: 'expert', prompt_value: '...' }]

// 2. UI lookup structure (global)  
builderComponentData = { role: { title: 'Role', prompts: { expert: '...' } } }

// 3. Workspace state (in appState)
appState.activeProject.builder = { role: { active: true, selection: 'expert', promptValue: '...' } }
```

**CRITICAL INSIGHT:**
- `builderComponentData` is built from database components during initialization
- It serves as a UI lookup for dropdown options and titles
- `updateComponentState()` uses BOTH builderComponentData AND appState.builder
- Component renaming updates ALL THREE structures

## CYCLE 7 FINDINGS - COMPONENT SELECTION FLOW

✅ **COMPLEX MULTI-LAYER SELECTION SYSTEM**
```javascript
// User selects dropdown → handleComponentSelect() →
updateComponentState(key, { selection: target.value }) →
  // Updates builder workspace state
  componentState.selection = 'expert'
  // Pulls prompt from lookup structure  
  componentState.promptValue = builderComponentData[key].prompts['expert']
  // OR restores user's custom text
  componentState.promptValue = componentState.userValue
```

**ADMIN PANEL INFINITE LOOP MECHANISM:**
- `handleComponentGroupCheckbox()` updates visibility → triggers `renderComponentsAdmin()` + `render()`
- `render()` calls `renderPromptSets()` which modifies builder state
- Disabled admin handlers `handleAdminSelectionInput()` / `handleAdminPromptInput()` would modify components
- Component changes would trigger re-initialization → **INFINITE LOOP**

## CYCLE 8 FINDINGS - PROJECT PERSISTENCE

✅ **IN-MEMORY PROJECT SYSTEM**
```javascript
// Project save/load is purely in-memory (appState.savedProjects)
handleProjectSave() → JSON.parse(JSON.stringify(appState.activeProject))
handleProjectLoad() → appState.activeProject = JSON.parse(JSON.stringify(loadedProject))
```

**CRITICAL PATTERNS:**
- Projects are NOT saved to database - only in browser memory
- Deep cloning used everywhere to prevent reference sharing
- Project load calls `applyPromptSet()` → `renderComponentsAdmin()` (triggers the dual system conflict)
- Admin reset completely rebuilds `appState` and `builderComponentData`

## FINAL ARCHITECTURAL PICTURE

🚨 **THE COMPLETE CHAOS:**

**FIVE SEPARATE DATA SYSTEMS:**
1. **Database** (SQLite) - Persistent components, promptSets, visibility
2. **appState.activeProject.components** - Database cache in memory
3. **builderComponentData** - Global UI lookup structure
4. **appState.activeProject.builder** - Workspace composition state
5. **appState.savedProjects** - In-memory project library

**FOUR COMPETING CONTROL MECHANISMS:**
1. **Visibility system** (database-driven, always wins)
2. **Template system** (dead code, overwritten)
3. **Admin panel editing** (disabled due to infinite loops)
4. **Direct builder manipulation** (user workspace actions)

**THREE SYNCHRONIZATION POINTS:**
1. **Initialization** - Database → all memory structures
2. **Prompt set switching** - Visibility overwrites template
3. **Component selection** - Workspace ↔ lookup structure

## PATTERNS TO TEST IN NEXT CYCLES:
- How do project save/load operations work?
- How does component selection flow work?
- What triggers re-initialization of builderComponentData?
- How does the admin panel sync back to builder state?
- What happens during error states? 