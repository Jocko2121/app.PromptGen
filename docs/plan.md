# Project Plan: AI Prompt Generator

## 1. Project Overview
- **Purpose:**
  - A local-first, Node.js-based AI Prompt Generator web app.
  - Allows users to create, manage, and save prompt projects for LLMs (Large Language Models).
  - Designed for personal/local use, but code will be open for others to self-host.
- **Frontend:**
  - Modern, single-page app (SPA) with a sidebar, project library, and prompt builder.
  - All UI logic and state management handled in the browser (index.html, CSS, JS).
  - No images or binary data—text only.

## 2. Features & Architecture

### UI/UX Structure and Guiding Principles
- The app is a state-driven, single-page application (SPA). All UI is rendered from a central `appState` object.
- Uses modern CSS (variables, flexbox, grid) for responsive, themeable design.
- Supports both dark and light modes via CSS variables and a toggle button.
- Main layout: sidebar (prompt library, jobs, project management) and main content area (panels for project hub, prompt builder, refinement, text transformer, article workspace).
- Sidebar is collapsible and contains quick access to jobs, project library, and an admin reset button.
- All interactive UI elements (buttons, selectors, textareas) are styled for clarity and accessibility.
- Collapsible panels for organization and focus (Prompt Builder, Refinement, Text Transformer, Article Workspace).
- Draft system for all major content blocks, allowing multiple versions and easy switching.
- All state changes are handled in-memory in the browser, with the intention to periodically persist to backend storage.

### Data Model and State Management
- **Single Source of Truth:** The `appState` object contains all application data.
- **Project Model:**
  - Each project has a unique ID, name, active job, builder config, content blocks, and text transformer state.
  - Projects are stored in `appState.savedProjects` (array), with the current project in `appState.activeProject`.
- **Builder Components:**
  - Configurable components: role, task, job, audiencePro, audienceSilly, format, tone, length, pov, context, constraints.
  - Each component can be active/inactive, has a selection, prompt value, and user value.
  - Predefined prompt templates for each component (see `builderComponentData` in code).
  - Visual differentiation between starter and modified components:
    - Starter components use default styling
    - User-modified components have distinct background color and optional visual indicators
    - Styling changes are managed through CSS variables for easy theming
    - Transition effects for smooth visual feedback when components are modified
  - Database Structure:
    - Starter components stored as static JSON in codebase (read-only)
    - User components table structure:
      ```sql
      CREATE TABLE user_components (
          id INTEGER PRIMARY KEY,
          original_starter_id TEXT,  -- references the starter component it was based on
          component_type TEXT,       -- role, task, job, etc.
          is_active BOOLEAN,
          selection TEXT,
          prompt_value TEXT,
          user_value TEXT,
          created_at TIMESTAMP,
          modified_at TIMESTAMP
      );
      ```
    - When a user modifies a starter component:
      1. New record created in user_components
      2. Original starter component referenced
      3. User modifications stored
      4. Visual styling updated to indicate modified state
- **Content Blocks:**
  - userOutline, finalPrompt, articleWorkspace, textTransformerInput, textTransformerOutput.
  - Each block has an array of drafts (id, timestamp, content) and an activeDraftId.
- **Text Transformer:**
  - Supports actions: summarize, rewrite, analyze (with sub-options for each).
  - Stores active action and options for each action.
- **Draft System:**
  - All major text areas support multiple drafts, with save/delete and active draft selection.
  - Drafts are timestamped and uniquely identified.
- **State Persistence:**
  - Currently in-memory only (per code comments), but designed for periodic save/load to backend.
  - Hybrid persistence strategy:
    - Auto-save:
      - Periodic background saves of general application state
      - Triggers every 30 seconds or after period of inactivity
      - Acts as safety net against data loss
      - Saves current state of all components, drafts, and settings
    - Manual saves:
      - Required for specific user actions:
        - Modifying starter components
        - Creating new custom components
        - Explicit project saves
        - Creating backups
        - Exporting data
      - Provides explicit user control for important changes
      - Ensures critical modifications are intentionally saved
  - Backup and Restore System:
    - Backup Management:
      - Maintains last 3 backups (configurable)
      - Each backup stored as timestamped SQLite file (e.g., `backup_2024_03_20_15_30.db`)
      - Stored in dedicated `backups/` directory
      - Automatic cleanup of oldest backup when limit reached
    - Backup Triggers:
      - Manual: User-initiated backup through UI
      - Automatic: Daily system backup
      - Skips backup if no changes since last backup
    - Restore Process:
      - User can switch between available backups
      - Before restore:
        1. Current state is automatically saved as a backup
        2. User can preview backup contents
        3. Confirmation required before restore
      - After restore:
        - System reloads with restored state
        - User notified of successful restore
    - Logging:
      - All backup/restore operations logged
      - Success/failure status tracked
      - Timestamps recorded for all operations

### Component and Feature Breakdown
- **Sidebar:**
  - Hamburger menu for collapse/expand
  - Job selectors (custom_build + templates)
  - Project library (list, load, delete projects)
  - Admin reset button (clears all state)
- **Project Hub Panel:**
  - Project title input
  - Save project button
  - Theme toggle buttons
- **Prompt Builder Panel:**
  - Add/remove builder components
  - Each component: header, remove button, controls (select, textarea)
  - Assemble all components into final prompt
- **Refinement Panel:**
  - User outline textarea (with drafts)
  - Insert button to add outline to final prompt
  - Final prompt textarea (with drafts, copy/clear buttons)
- **Text Transformer Panel:**
  - Input/output textareas (with drafts)
  - Action selectors (summarize, rewrite, analyze)
  - Options for actions (radio buttons)
  - Transform and copy-up buttons
- **Article Workspace Panel:**
  - Large textarea for final article (with drafts)

### Notable Design Decisions and Patterns
- **All UI state is derived from a single JS object (`appState`), making it easy to serialize/deserialize for persistence.**
- **Component-based rendering:** Each major UI section has its own render function, which reads from `appState` and updates the DOM.
- **Event delegation:** Main event listeners are attached to container elements and use event.target to determine action, reducing the number of listeners.
- **Extensible builder model:** New builder components or prompt templates can be added by extending the `builderComponentData` and `jobTemplates` objects.
- **Draft system is generic and used across all major content blocks, supporting versioning and undo.**
- **Theme support is built-in and easily extendable.**
- **Admin reset and project management features are first-class, supporting robust user workflows.**

### Useful Comments and Patterns from Code
- The code is heavily commented, especially around architecture and data model.
- Comments clarify that the current version is in-memory only, but the structure is ready for persistent storage.
- The builder and content block models are designed for flexibility and future expansion.
- UI logic is separated from data/model logic, making it easier to refactor or port to a framework if desired.

---

## 3. Technical Decisions & Rationale
- **Node.js**: Chosen for backend due to familiarity, ecosystem, and ease of local hosting.
- **Express**: Used for serving static files and simple API endpoints. Chosen for future flexibility, minimal overhead, and wide support.
- **better-sqlite3**: Chosen for database. Reasons:
  - File-based, zero-config, perfect for local use
  - Easy to upgrade to more robust DB later if needed
  - Supports JSON storage for app state
- **No images/binary data**: All data is text, so storage and performance are not concerns.
- **Folder structure**: Designed for clarity, scalability, and best practices (see below).
- **Minimal dependencies**: Only Express and better-sqlite3 (plus nodemon for dev, if desired).
- **Testing Strategy**:
  - Development Testing:
    - Use Node's built-in `assert` module for basic tests
    - Test critical paths only (database operations, backup/restore)
    - Keep tests simple and close to the code
    - No separate test servers or complex setups
  - Runtime Testing:
    - Basic data validation in database operations
    - Simple error logging to text file
    - Backup file integrity checks
    - No complex monitoring systems
  - Testing Focus Areas:
    1. Database Operations:
       - Component saving/loading
       - State persistence
       - Data integrity
    2. Backup System:
       - Backup creation
       - Restore process
       - File integrity
    3. Error Handling:
       - Basic error logging
       - Recovery procedures

## 4. Folder Structure (as of initial commit)
```
/app.PromptGen
├── public/        # Static files (index.html, CSS, client JS)
├── src/           # Server code (Express, DB logic)
├── test/          # Test scripts
├── docs/          # Documentation, plans, design notes
├── config/        # (empty, for future config files)
├── data/          # (empty, for SQLite DB and backups)
├── logs/          # (empty, for future log files)
├── scripts/       # (empty, for future utility scripts)
├── reference/     # (for wireframes, design docs)
├── package.json
└── README.md
```

## 5. Setup & Verification
- Analyzed and documented the HTML app structure and state management.
- Decided on SQLite (better-sqlite3) for persistent storage, with JSON blob for app state.
- Chose Express for serving static files and future API endpoints.
- Created the above folder structure.
- Moved index.html to public/.
- Installed and tested better-sqlite3 and Express for compatibility with Node.js v18.19.1.
- Created a basic Express server (src/server.js) that:
  - Serves static files from public/
  - Provides a /api/health endpoint
  - Fallback route for SPA support
- Verified server runs and app loads at http://localhost:3000
- Verified /api/health returns {"status": "ok"}
- Initialized git, made initial commit, and pushed to GitHub.
- Static file serving (index.html loads in browser)
- Express server starts with no errors
- Health endpoint works
- Git integration and remote push confirmed

## 6. Completed Features
- Database Integration:
  - SQLite database setup with proper schema
  - User components table with all required fields
  - CRUD operations for user components
  - Boolean-to-number conversion for SQLite compatibility
  - Database connection and error handling
  - Test endpoints for database operations
- State Persistence:
  - Auto-save functionality (30-second intervals)
  - Manual save triggers for component modifications
  - State dirty flag management
  - Database-backed state storage
  - Error handling and recovery
- Testing Infrastructure:
  - Test component creation page
  - Database operation verification
  - Error logging and debugging tools
  - Component viewing and validation

## 7. Open Questions & Next Steps
- Add backup/export functionality for app state
- Write more documentation and split docs as project grows
- Add more tests (API, DB, integration)
- Consider user content export/import (Markdown, JSON)
- Plan for future features (multi-user, authentication, etc.)
- Implement component management UI in main application
- Add component versioning and history
- Create component templates and presets

## 8. Important Context & Lessons Learned
- All decisions and changes are discussed and approved before implementation
- Minimal dependencies to avoid bloat and compatibility issues
- Express was chosen after careful consideration and explicit approval
- All setup steps are documented for reproducibility
- Project is designed for local-first, but with an eye toward future expansion
- SQLite requires explicit type handling (e.g., boolean to number conversion)
- State persistence should be handled carefully to avoid data loss
- Testing tools should be kept for future development and debugging

---

**This file should be updated as the project evolves.** 