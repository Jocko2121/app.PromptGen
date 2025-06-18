

## **Notes**
- Epics are guidelines that evolve as we learn more about the system's needs
- Items moved to Phase 2 are enhancements that don't affect core functionality
- Priority should be given to items that affect data integrity and system reliability

# *Phase 1: Core Infrastructure & Functionality Implementation*

**[x] Epic 1.1 - Database Management and Backup**

- [x] Implement database backup functionality
  - [x] Create backup endpoint
  - [x] Add backup file management
  - [x] Implement restore functionality
  - [x] Add backup rotation (last 3 backups)
  - [x] Add backup verification and integrity checks
- [x] Add database integrity checks
  - [x] Implement integrity check endpoint
  - [x] Add validation for database structure
- [x] Implement database optimization
  - [x] Add optimization endpoint
  - [x] Implement VACUUM and ANALYZE
- [x] Add database cleanup functionality
  - [x] Implement cleanup endpoint
  - [x] Add removal of unused data
- [x] Create test pages for all database operations
  - [x] Combined all database tests into test-database.html
  - [x] Added clear guidance and numbered sections
  - [x] Organized old test pages into archive

**[x] Epic 1.2 - State Persistence System**
    - [✓] Implement auto-save functionality (30-second intervals)
    - [✓] Add manual save triggers for critical operations
    - [✓] Create state recovery mechanism
    - [✓] Implement state dirty flag management
    - [✓] Add database-backed state storage
    - [✓] Set up error handling and recovery

**Epic 1.3 - Component Management System**
    - [✓] Implement starter component loading
    - [✓] Add user component modification and saving
    - [✓] Create visual differentiation for modified components
    - [✓] Set up component creation and retrieval
    - [✓] Implement component validation

**[x] Epic 1.4 - Testing Infrastructure**
    - [✓] Set up basic testing with Node's assert module
    - [✓] Implement critical path tests
    - [✓] Add runtime data validation
    - [✓] Create test component creation page
    - [✓] Add database operation verification
    - [✓] Implement error logging and debugging tools
 
[ ] **Epic 1.5 - Database Optimization and Advanced Features**
    - [Keep] *Add database performance monitoring*
    - [removed] Implement database connection pooling for concurrent operations
    - [removed] Create database maintenance routines (cleanup, optimization)
    - [removed] Implement query optimization
    - [removed] Add database caching layer
    - [removed] Create database health check system

[ ] **Epic 1.6 - Advanced State Management**
    - [removed] Implement state versioning and history
    - [removed] Add state conflict resolution for concurrent modifications
    - [removed] Implement state compression for large datasets
    - [removed] Create state analytics and monitoring
    - [removed] Add state rollback points
    - [removed] Implement state synchronization

[ ] **Epic 1.7 - Enhanced Backup System**
    - [removed] Add backup metadata tracking
    - [removed] Implement partial restore capability
    - [removed] Add backup encryption
    - [removed] Create backup analytics
    - [removed] Implement backup verification automation
    - [removed] Add backup scheduling optimization

[ ] **Epic 1.8 - Comprehensive Testing Suite**
    - [Keep] *Implement end-to-end testing*
    - [removed] Create performance testing framework
    - [removed] Implement stress testing for concurrent operations
    - [removed] Add integration test suite
    - [removed] Add load testing capabilities
    - [removed] Create automated test reporting
    - [removed] Implement continuous testing pipeline





[ ] **Epic 1.9 - Advanced Component Management**
    - [Keep] *Implement component search and filtering*
    - [removed] Add component dependencies management
    - [Later] *Create component import/export functionality*
    - [Keep] *Implement component categorization and tagging*
    - [removed] Add component analytics
    - [removed] Create component template system
    - [removed] Implement component version control

[ ] **Epic 1.10 - Error Handling Improvements**
    - [ ] Implement Global Error Handler
      - [ ] Create centralized error handling service
      - [ ] Standardize error response format
    - [ ] Add Error Logging System
      - [ ] Implement structured logging
    - [ ] Create Error Notification System
      - [ ] Add user-friendly error messages


## **Notes**
- Phase 2 focuses on system enhancement and optimization
- Items are organized by functional area
- Implementation order may be adjusted based on user needs and system performance


## **Important Context & Lessons Learned**
- All decisions and changes are discussed and approved before implementation
- Minimal dependencies to avoid bloat and compatibility issues
- Express was chosen after careful consideration and explicit approval
- All setup steps are documented for reproducibility
- Project is designed for local-first, but with an eye toward future expansion
- SQLite requires explicit type handling (e.g., boolean to number conversion)
- State persistence should be handled carefully to avoid data loss
- Testing tools should be kept for future development and debugging


## Revisit 1.5

### Task 3: Database Performance Monitoring Analysis

#### Current Implementation
- Basic health checks in server.js
- Database size monitoring in cleanup.js
- Simple connection verification

#### Proposed Implementation
- Add query execution time tracking
- Monitor slow queries (>100ms threshold)
- Track table growth over time
- Monitor index usage statistics
- Keep implementation lightweight and low-overhead

#### Benefits
- Identify performance bottlenecks
- Guide optimization decisions
- Help with debugging
- Prevent performance degradation
- Provide data for future improvements

#### Implementation Approach
- Add timing wrappers around critical queries
- Log slow queries with context
- Track table sizes periodically
- Monitor index usage
- Keep overhead minimal

#### Recommendation: Keep (Simplified Scope)
- Focus on essential metrics only
- Avoid complex monitoring systems
- Keep implementation simple
- Prioritize debugging value over comprehensive monitoring

## Revisit 1.8

### Task 1: Integration Test Suite Analysis

#### Current Implementation
- Basic testing with Node's assert module
- Critical path tests
- Runtime data validation
- Test component creation page
- Database operation verification
- Error logging and debugging tools

#### Analysis
- Application architecture is straightforward:
  - Local-first application using SQLite
  - Components stored in single table
  - Simple state management
  - Minimal component interactions
- Current testing infrastructure already covers integration points:
  - test-database.html for database operations
  - test-api.html for API endpoints
  - Database constraints and triggers enforce integrity
  - Integrity checks in maintenance.js

#### Recommendation: Remove
- Redundant with existing testing infrastructure
- Application architecture is simple enough for unit tests
- Database constraints already enforce data integrity
- Existing test pages cover component interactions

### Task 2: End-to-End Testing Analysis

#### Current Implementation
- Individual component testing
- API endpoint testing
- Database operation testing
- No complete user flow testing

#### Critical User Flows
- Creating and modifying components
- Managing drafts in content blocks
- State persistence and recovery
- Backup and restore operations
- Project management (save/load/delete)

#### Complex State Management
- Auto-save functionality
- Manual save triggers
- State dirty flag management
- Multiple drafts per content block
- Project state persistence

#### User Interactions
- Adding/removing builder components
- Modifying component values
- Generating final prompts
- Managing drafts
- Theme switching
- Project management

#### Recommendation: Keep
- Current testing doesn't verify complete user flows
- Complex state management needs end-to-end verification
- Important user interactions span multiple components
- Critical for ensuring system reliability



# *Phase 2: Database Initialization & Component Management*

## Overview
The goal is to move from hardcoded components to a database-driven system while maintaining the app's core functionality. This involves:
1. Creating a database initialization process
2. Moving hardcoded components to a separate initialization file
3. Maintaining builderComponentData's structural role in the app

## Epic 2.1 - Database Initialization System
- [ ] Create database initialization process
  - [ ] Add database existence check in database.js
  - [ ] Create new database if none exists
  - [ ] Run migrations on new database
  - [ ] Add starter components from initialization file
- [ ] Create initialization file (src/db/initialization.js)
  - [ ] Move hardcoded components from builderComponentData to initialization file
  - [ ] Structure components for database insertion
  - [ ] Add validation for initialization data
- [ ] Add initialization error handling
  - [ ] Handle database creation failures
  - [ ] Handle migration failures
  - [ ] Handle component insertion failures
- [ ] Update server.js initialization sequence
  - [ ] Check database existence
  - [ ] Run migrations if needed
  - [ ] Run initialization if needed
  - [ ] Start state persistence

## New Files Required
- `src/db/initialization.js`: Contains starter components and initialization logic
  - No other new files needed
  - All other functionality uses existing files

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

## Scope Boundaries
- No changes to existing database structure
- No changes to existing UI behavior
- No changes to existing backup/restore functionality
- No changes to other API endpoints
- No changes to state persistence core functionality

## Important Notes
- Starter components will be moved to database
- Database must be properly initialized before app can start
- No fallback to hardcoded components - database must be working
- starter-components.js is the source of truth for creating a new database
- Simple process: check for database → if none exists → run starter-components.js

## Epic 2.2 - Component Structure Management
- [ ] Maintain builderComponentData structure
  - [ ] Keep component type definitions (role, task, format, etc.)
  - [ ] Keep component titles
  - [ ] Keep prompt structure definitions
  - [ ] Remove hardcoded prompt values
- [ ] Update component rendering
  - [ ] Modify renderBuilderPallet to use database for prompt values
  - [ ] Update component state management
  - [ ] Ensure UI remains consistent

## Epic 2.3 - Testing & Verification
- [ ] Add initialization testing
  - [ ] Test database creation
  - [ ] Test component insertion
  - [ ] Verify component structure
- [ ] Add component validation
  - [ ] Verify component types
  - [ ] Verify component relationships
  - [ ] Test component modifications

## Important Notes
- builderComponentData remains in index.html but only contains structure, not values
- Component values come from database, structure comes from builderComponentData
- Initialization only happens once when database is first created
- All components (including "starter" ones) are treated equally in the database

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