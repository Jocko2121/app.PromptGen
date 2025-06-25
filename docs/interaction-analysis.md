# Complete User Interaction Analysis (UPDATED)

## Purpose
This table maps every possible user interaction to understand exactly what needs to happen for each action. Updated to reflect **tab-based coordination strategy**.

## Key Insight: Tab-Based Updates
- **Immediate updates:** Only within the currently active tab
- **Cross-tab sync:** Deferred until user switches tabs
- **Performance:** No wasteful re-renders of hidden tabs

## Interaction Categories

### WORKSPACE INTERACTIONS

| User Action | AppState Change | Database Change | Current Tab Re-render | Tab Sync Required | Notes |
|-------------|----------------|-----------------|---------------------|-------------------|--------|
| **Project Management** |
| Type in project title | ✅ `workspace.activeProject.name` | ❌ | ✅ Title field + Library (immediate) | ❌ | Real-time within workspace |
| Save project | ✅ `workspace.projectLibrary` | ❌ | ✅ Library panel | ❌ | In-memory save only |
| Save as project | ✅ `workspace.projectLibrary` + new active | ❌ | ✅ Library panel | ❌ | Creates copy |
| Load project | ✅ Replace entire `workspace.activeProject` | ❌ | ✅ All workspace panels | ✅ Admin tab (if resources changed) | Major state change |
| Delete project | ✅ `workspace.projectLibrary` | ❌ | ✅ Library panel | ❌ | Remove from memory |
| Reset (admin) | ✅ Reset entire `workspace` | ❌ | ✅ Everything | ✅ All tabs | Nuclear reset |
| **Prompt Set Management** |
| Switch prompt set | ✅ `workspace.activeProject.promptSetConfig.activeSet` | ❌ | ✅ Builder panel | ✅ Admin tab (visibility changes) | Changes visible components |
| **Component Composition** |
| Select component dropdown | ✅ `workspace.activeProject.promptSetConfig.configurations[set].composition[type]` | ❌ | ✅ Component content only | ❌ | Updates content only |
| Type in component textarea | ✅ `workspace.activeProject.promptSetConfig.configurations[set].composition[type].content` | ❌ | ❌ (real-time typing) | ❌ | Real-time typing |
| Add component to builder | ✅ `workspace.activeProject.promptSetConfig.configurations[set].visibility[type] = true` | ❌ | ✅ Builder panel | ✅ Admin tab (visibility) | Shows new component |
| Remove component from builder | ✅ `workspace.activeProject.promptSetConfig.configurations[set].visibility[type] = false` | ❌ | ✅ Builder panel | ✅ Admin tab (visibility) | Hides component |
| **Content Blocks** |
| Type in content block | ✅ `workspace.activeProject.contentBlocks[block].drafts[active].content` | ❌ | ❌ (real-time typing) | ❌ | Real-time typing |
| Save draft | ✅ Add to `workspace.activeProject.contentBlocks[block].drafts` | ❌ | ✅ Draft controls | ❌ | New draft created |
| Delete draft | ✅ Remove from `workspace.activeProject.contentBlocks[block].drafts` | ❌ | ✅ Draft controls | ❌ | Draft removed |
| Select draft | ✅ `workspace.activeProject.contentBlocks[block].activeDraftId` | ❌ | ✅ Textarea content | ❌ | Switch active draft |
| Insert outline | ✅ `workspace.activeProject.contentBlocks.finalPrompt` content | ❌ | ✅ Final prompt textarea | ❌ | Appends text |
| Clear content | ✅ `workspace.activeProject.contentBlocks.finalPrompt` content | ❌ | ✅ Final prompt textarea | ❌ | Clears text |
| Assemble all | ✅ `workspace.activeProject.contentBlocks.finalPrompt` content | ❌ | ✅ Final prompt + Tab switch | ❌ | Builds from components |
| Copy to clipboard | ❌ | ❌ | ✅ Button state only | ❌ | Browser clipboard API |
| **Text Transformer** |
| Select transformer action | ✅ `workspace.activeProject.textTransformer.activeAction` | ❌ | ✅ Options panel | ❌ | Shows different options |
| Select transformer option | ✅ `workspace.activeProject.textTransformer.actions[action].activeOption` | ❌ | ❌ | ❌ | Updates selection only |
| Execute transform | ✅ `workspace.activeProject.contentBlocks.textTransformerOutput.drafts` | ❌ | ✅ Output textarea | ❌ | Creates new draft |
| Copy up result | ✅ `workspace.activeProject.contentBlocks.textTransformerInput.drafts` | ❌ | ✅ Input textarea | ❌ | Copies output to input |

### ADMIN PANEL INTERACTIONS

| User Action | AppState Change | Database Change | Current Tab Re-render | Tab Sync Required | Critical Behavior |
|-------------|----------------|-----------------|---------------------|-------------------|-------------------|
| **Component Library Management** |
| Toggle component active/inactive (onBlur) | ✅ `resources.components[id].is_active` | ✅ UPDATE components SET is_active | ✅ Admin panel | ✅ Workspace tab (when switched) | **Workspace updates on tab switch** |
| Edit component selection name (onBlur) | ✅ `resources.components[id].selection` | ✅ UPDATE components SET selection | ✅ Admin panel | ✅ Workspace tab (when switched) | **Dropdowns update on tab switch** |
| Edit component prompt value (onBlur) | ✅ `resources.components[id].prompt_value` | ✅ UPDATE components SET prompt_value | ✅ Admin panel | ✅ Workspace tab (when switched) | **Content updates on tab switch** |
| **Component Type Management** |
| Rename component type (onBlur) | ✅ `resources.componentTypes[].display_name` + ALL references | ✅ UPDATE component_types SET display_name | ✅ Admin panel | ✅ Workspace tab (when switched) | **Labels update on tab switch** |
| **Prompt Set Visibility** |
| Toggle component in prompt set (onChange) | ✅ `resources.visibility[]` + `workspace` if active set | ✅ UPDATE/INSERT visibility | ✅ Admin panel | ✅ Workspace tab (if active set) | **Components appear/disappear on tab switch** |
| **Admin UI** |
| Toggle show/hide details | ✅ `workspace.settings.showAdminDetails` | ❌ | ✅ Admin panel only | ❌ | UI state only |

### UI INTERACTIONS

| User Action | AppState Change | Database Change | Current Tab Re-render | Tab Sync Required | Notes |
|-------------|----------------|-----------------|---------------------|-------------------|--------|
| Toggle panel collapse | ❌ | ❌ | ❌ | ❌ | Pure CSS |
| **Switch tab** | ✅ `workspace.settings.activeTab` | ❌ | ✅ Target tab (with sync) | ✅ **THIS IS THE KEY SYNC POINT** | **Cross-tab coordination happens here** |
| Toggle sidebar | ❌ | ❌ | ❌ | ❌ | Pure CSS |
| Switch theme | ✅ `workspace.settings.theme` | ❌ | ❌ | ❌ | CSS class change |

## CRITICAL ARCHITECTURAL PATTERNS

### **1. Tab Switch Coordination (THE KEY INSIGHT)**
```javascript
function handleTabSwitch(targetTab) {
  // 1. Update active tab
  updateAppState('workspace.settings.activeTab', targetTab);
  
  // 2. Sync data between tabs
  const syncRequired = detectCrossTabChanges();
  if (syncRequired) {
    applyCrossTabSync(targetTab);
  }
  
  // 3. Render target tab with latest data
  renderTab(targetTab);
}
```

### **2. Input Field Pattern**
```javascript
// Real-time responsiveness (onInput)
onInput: updateAppState(path, value) + updateCurrentTabDisplay()

// Coordination point (onBlur) 
onBlur: saveToDatabase(data) + markTabForSync(otherTabs)
```

### **3. Cross-Tab Sync Detection**
```javascript
function detectCrossTabChanges() {
  // Check if admin changes affect workspace
  // Check if workspace changes affect admin
  // Return list of required syncs
}
```

## PERFORMANCE BENEFITS

### **Before (Immediate Updates):**
- Admin change → Update admin panel + workspace panel (even if hidden)
- Workspace change → Update workspace + admin (even if hidden)
- Lots of wasteful re-renders

### **After (Tab-Based Coordination):**
- Admin change → Update admin panel only
- Tab switch → Sync + render target tab once
- No wasteful re-renders of hidden tabs

## FUNCTION COMPOSITION PATTERNS

### **State Updaters**
```javascript
updateCurrentTabState(path, value)    // Immediate updates within active tab
updateCrossTabState(path, value)      // Updates that affect other tabs (marked for sync)
```

### **Database Operations** 
```javascript
saveOnBlur(entity, data)              // Save when user finishes editing
saveBulkChanges(changes)              // Batch operations
```

### **Tab Coordination**
```javascript
detectSyncNeeds(fromTab, toTab)       // What needs to sync?
applyCrossTabSync(targetTab)          // Apply accumulated changes
renderTabWithSync(tab)                // Render with latest synced data
```

### **Render Coordinators**
```javascript
renderCurrentTab(sections)            // Update active tab only
renderTabOnSwitch(tab, syncData)      // Render target tab with synced data
```

## NEXT STEPS

1. **Validate tab switching behavior** - Does this match your mental model?
2. **Define sync detection logic** - What admin changes affect workspace?
3. **Design conflict resolution** - What if changes conflict?
4. **Performance testing** - Is tab-based coordination fast enough? 