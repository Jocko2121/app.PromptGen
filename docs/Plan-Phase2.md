# Project Plan: Phase 2 - Settings for components

**[x] Epic 2.1 - Database Restructuring**
    - [x] Create starter-components.js file with default components
    - [x] Remove builderComponentData from index.html
    - [x] Create initialization.js to seed database with starter components if needed
    - [x] Update database initialization logic in server.js to run initialization before serving
    - [x] Update /starter-components API endpoint to serve components from the database
    - [x] Update frontend (index.html) to fetch and use components from the API for the Prompt Builder
    - [x] Verify end-to-end functionality: Prompt Builder loads from database-driven source



**Notes:**
- Focus on transitioning to a database-driven system while maintaining backward compatibility
- All [DECISION NEEDED] items require team discussion and agreement before implementation
- Each epic should be completed and tested before moving to the next
- Regular backups should be taken throughout the process
- Performance monitoring should be in place before removing hardcoded data

**Risk Mitigation Strategy:**
1. **Phase 1 - Setup (Epics 2.1 & 2.2)**
   - Create infrastructure without changing existing behavior
   - Add logging and monitoring
   - Test thoroughly before proceeding

2. **Phase 2 - Transition (Epics 2.3 & 2.4)**
   - Implement changes with fallback to hardcoded data
   - Add extensive logging
   - Monitor performance and errors

3. **Phase 3 - Cleanup (Epics 2.5 & 2.6)**
   - Remove hardcoded data only after thorough testing
   - Keep backup of hardcoded data
   - Monitor closely after removal

**Critical Points (Updated):**
- App state structure must remain compatible
- Component references must be maintained
- State persistence must work reliably
- Performance must be monitored
- Backups must be maintained
- Rollback plan must be ready
- Server initialization order must be preserved
- API backward compatibility must be maintained
- Transaction safety must be ensured
- Auto-save functionality must be preserved

**Additional Considerations:**
1. **Server Initialization**
   - Must maintain current initialization order
   - Need to handle initialization failures gracefully
   - Must preserve existing error handling

2. **API Compatibility**
   - Existing endpoints must continue to work
   - New endpoints must follow current patterns
   - Error handling must be consistent

3. **State Management**
   - Auto-save must work with new structure
   - State loading must handle both data sources
   - Performance must be maintained

4. **Database Operations**
   - Transaction safety must be preserved
   - Error handling must be consistent
   - Performance must be monitored

## **Notes**
- Phase 2 focuses on moving component management to database-driven system
- All changes must maintain backward compatibility
- Database initialization must be reliable and verifiable
- UI updates should be seamless to users
- Testing should cover all critical paths
- [DECISION NEEDED] Items require team discussion and agreement before implementation

## **Important Considerations**
- Need to handle transition period carefully
- Must maintain data integrity throughout changes
- Should consider performance implications
- Need to plan for error recovery
- Should document all changes for future reference
- Must consider impact on existing backup system
- Need to plan for database migration of existing installations
- Should consider memory usage and caching strategies
- Must handle state persistence carefully
- Need to plan for UI feedback during database operations

**Technical Requirements and Limitations:**

1. **Database (SQLite)**
   - Single-writer limitation is acceptable (single-user app)
   - JSON storage and validation supported
   - Transaction support available
   - Trigger support available
   - Index support available
   - Foreign key support available
   - No additional database features needed

2. **Server (Express)**
   - Current version supports all required features
   - No additional middleware needed
   - No WebSocket requirements
   - No real-time update requirements

3. **Dependencies**
   - All required features available in current versions:
     - better-sqlite3 (v8.7.0)
     - express (v4.18.2)
     - nodemon (v3.0.2)
   - No additional packages needed

4. **Performance Considerations**
   - SQLite is suitable for our data size
   - No need for connection pooling
   - No need for query optimization
   - Caching can be handled in memory

5. **Security Considerations**
   - No additional security measures needed
   - Current setup is appropriate for single-user app
   - No need for authentication/authorization
   - No need for input sanitization beyond current measures

**Implementation Notes:**
1. All database operations can use existing patterns
2. No need to modify server architecture
3. No need to add new dependencies
4. Current error handling is sufficient
5. Current backup system is adequate

## Critical Operation
The most important part of Phase 2 is moving the default components from `builderComponentData` in `index.html` to `starter-components.js`. This is critical because:
- It's the source of truth for creating new databases
- It enables the database-driven component system
- It allows users to backup their database and start fresh
- It removes hardcoded data from the app

## Files to Modify
1. `src/db/database.js`
   - Add database existence check
   - If no database exists, run starter-components.js to create one
   - No other changes needed

2. `src/server.js`
   - Update initialization sequence
   - No other changes needed

3. `public/index.html`
   - Remove hardcoded components from builderComponentData
   - Keep component structure
   - No other changes needed

4. `src/routes/api.js`
   - Update `/starter-components` endpoint to read from database
   - Add proper error handling for database failures
   - No other API endpoint changes needed

5. `src/services/state-persistence.js`
   - Add database readiness check before loading state
   - Update initialization sequence
   - No other changes needed

6. `src/db/starter-components.js`
   - Move all default components from builderComponentData to this file
   - This file will be the source of truth for new database creation
   - No other changes needed 

# *Phase 2: Refactoring Job/Template Terminology*

## Refactoring Plan

Here's what we need to refactor:

1. **JavaScript Variables/Functions**:
   - `jobTemplates` → `promptSets`
   - `activeJob` → `activePromptSet`
   - `applyJobTemplate` → `applyPromptSet`
   - `renderJobs` → `renderPromptSets`
   - `jobKeys` → `promptSetKeys`
   - `jobKey` → `promptSetKey`

2. **HTML Elements/IDs**:
   - `jobs-list` → `prompt-sets-list`
   - `job-selector` → `prompt-set-selector`
   - `data-job-key` → `data-prompt-set-key`

3. **CSS Classes**:
   - `.sidebar__jobs-list` → `.sidebar__prompt-sets-list`
   - `.job-selector` → `.prompt-set-selector`
   - `.job-selector:hover` → `.prompt-set-selector:hover`
   - `.job-selector.active` → `.prompt-set-selector.active`

4. **Component References**:
   - In `starter-components.js`: `job` component type remains (as it's a specific component type)
   - In `maintenance.js`: `job` in component type list remains

5. **Documentation**:
   - Update references in `Project Overview.md` and other docs
   - Update comments in code

Note: The database schema doesn't use these terms, so no database changes are needed.


   