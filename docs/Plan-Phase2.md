# *Phase 2: Settings for components*

**[ ] Epic 2.1 - Database Restructuring**
    - [ ] Create new database table for master components
      - [ ] Define schema for master_components table
      - [ ] Add necessary indexes and constraints
      - [ ] Create migration script
    - [ ] Modify existing user_components table
      - [ ] Update foreign key relationships
      - [ ] Add any necessary new fields
      - [ ] Create migration script
    - [ ] Update server initialization
      - [ ] Modify server.js to handle initialization
      - [ ] Add initialization checks
      - [ ] Update error handling
    - [DECISION NEEDED] Define migration strategy for existing databases
      - [ ] Create migration path for existing user components
      - [ ] Define how to handle existing relationships
      - [ ] Plan for potential data loss scenarios

**[ ] Epic 2.2 - Initialization System Setup**
    - [ ] Create separate initialization system
      - [ ] Create new file `src/db/initialization.js`
      - [ ] Move all hardcoded data from index.html to initialization.js
      - [ ] Add function to check if database needs initialization
      - [ ] Create function to populate master components
      - [ ] Add verification steps for initialization
    - [ ] Create compatibility layer
      - [ ] Add function to load components from database
      - [ ] Create fallback to hardcoded data
      - [ ] Add logging for data source tracking
    - [ ] Update API endpoints
      - [ ] Add new endpoint for master components
      - [ ] Maintain backward compatibility
      - [ ] Add proper error handling
    - [DECISION NEEDED] Determine initialization timing
      - [ ] Define when initialization should occur relative to migrations
      - [ ] Plan for initialization failures
      - [ ] Create rollback strategy

**[ ] Epic 2.3 - Component Data Transition**
    - [ ] Update component loading system
      - [ ] Modify component loading to try database first
      - [ ] Add fallback to hardcoded data
      - [ ] Add logging for debugging
    - [ ] Update UI component rendering
      - [ ] Modify render functions to handle both data sources
      - [ ] Add error handling for missing components
      - [ ] Add loading states for database operations
    - [ ] Update state persistence
      - [ ] Modify state loading to handle database components
      - [ ] Update auto-save functionality
      - [ ] Add validation for component references
    - [DECISION NEEDED] Define caching strategy
      - [ ] Determine when to cache components
      - [ ] Define cache invalidation rules
      - [ ] Set memory usage limits

**[ ] Epic 2.4 - App State Integration**
    - [ ] Modify appState initialization
      - [ ] Update state loading to handle database components
      - [ ] Add validation for component references
      - [ ] Create state recovery mechanism
    - [ ] Update state persistence
      - [ ] Modify save/load operations for new structure
      - [ ] Add validation before saving
      - [ ] Create backup mechanism
    - [DECISION NEEDED] Define state loading order
      - [ ] Determine component loading timing
      - [ ] Plan for state recovery
      - [ ] Define error handling strategy

**[ ] Epic 2.5 - Testing and Verification**
    - [ ] Create test suite
      - [ ] Add tests for initialization
      - [ ] Add tests for component loading
      - [ ] Add tests for state persistence
    - [ ] Add monitoring
      - [ ] Create logging for initialization
      - [ ] Add performance metrics
      - [ ] Set up error tracking
    - [DECISION NEEDED] Define backup integration
      - [ ] Plan backup strategy
      - [ ] Define recovery procedures
      - [ ] Set up monitoring

**[ ] Epic 2.6 - Cleanup and Optimization**
    - [ ] Remove hardcoded data
      - [ ] Remove builderComponentData object
      - [ ] Clean up any remaining references
      - [ ] Verify no hardcoded data remains
    - [ ] Optimize performance
      - [ ] Review and optimize queries
      - [ ] Implement caching if needed
      - [ ] Add performance monitoring
    - [ ] Final verification
      - [ ] Run full test suite
      - [ ] Verify all features work
      - [ ] Check performance metrics

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

## Critical Aspects of Phase 2
1. Move hardcoded components from builderComponentData to database
   - Components will be moved to starter-components.js
   - Used to create initial database
   - No longer hardcoded in the app

2. Update app to read components from database
   - App currently assumes components are hardcoded
   - Need to check for any hidden dependencies
   - State management remains the same, just different data source

## Potential Risks
- App might assume certain components always exist (because they were hardcoded)
- App might expect certain component properties (because they were hardcoded)
- Need to verify app can handle components as regular database entries

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