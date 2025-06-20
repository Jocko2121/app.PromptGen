-- 006_add_component_types.sql

-- Disable foreign keys for the duration of the migration
PRAGMA foreign_keys=off;

-- =================================================================================
-- Step 1: Create the new `component_types` table
-- This table will store the master list of component groups.
-- `type_key` is the stable, machine-readable key (e.g., "role", "task").
-- `display_name` is the user-facing, editable name (e.g., "Role", "Persona").
-- =================================================================================
CREATE TABLE IF NOT EXISTS component_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =================================================================================
-- Step 2: Rename the existing `user_components` table
-- This preserves the existing data so we can migrate it.
-- =================================================================================
ALTER TABLE user_components RENAME TO _user_components_old;

-- =================================================================================
-- Step 3: Create the new `user_components` table with the foreign key
-- `component_type` is replaced with `component_type_id`.
-- =================================================================================
CREATE TABLE user_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_type_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1 NOT NULL,
    is_starter BOOLEAN DEFAULT 0 NOT NULL,
    selection TEXT NOT NULL,
    prompt_value TEXT,
    user_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (component_type_id) REFERENCES component_types (id) ON DELETE CASCADE
);

-- =================================================================================
-- Step 4: Populate `component_types` from the distinct old types
-- This ensures that any existing component types are carried over.
-- We use the old `component_type` name for both the `type_key` and `display_name` initially.
-- The `display_name` can be changed later by the user.
-- =================================================================================
INSERT INTO component_types (type_key, display_name)
SELECT DISTINCT
    LOWER(component_type), -- Use lowercase for the stable key
    component_type         -- Keep original case for the display name
FROM _user_components_old;

-- =================================================================================
-- Step 5: Migrate data from the old table to the new one
-- This joins the old table with the new `component_types` table to get the
-- correct `component_type_id` for each component.
-- =================================================================================
INSERT INTO user_components (id, component_type_id, is_active, is_starter, selection, prompt_value, user_value, created_at, modified_at)
SELECT
    o.id,
    ct.id,
    o.is_active,
    o.is_starter,
    o.selection,
    o.prompt_value,
    o.user_value,
    o.created_at,
    o.modified_at
FROM _user_components_old o
JOIN component_types ct ON LOWER(o.component_type) = ct.type_key;

-- =================================================================================
-- Step 6: Drop the old table
-- Now that the data is safely migrated, we can remove the old table.
-- =================================================================================
DROP TABLE _user_components_old;

-- =================================================================================
-- Step 7: Manually insert the starter component types
-- This is critical for ensuring that a fresh database has the necessary types
-- before the application's seeding logic runs.
-- =================================================================================
INSERT INTO component_types (type_key, display_name) VALUES
    ('role', 'Role'),
    ('task', 'Task'),
    ('job', 'Job'),
    ('audiencePro', 'Audience - Professional'),
    ('audienceSilly', 'Audience - Silly'),
    ('format', 'Format'),
    ('tone', 'Tone'),
    ('length', 'Length'),
    ('pov', 'Point of View'),
    ('context', 'Context'),
    ('constraints', 'Constraints');

-- =================================================================================
-- Step 8: Create indexes for better performance
-- =================================================================================
CREATE INDEX IF NOT EXISTS idx_user_components_component_type_id ON user_components (component_type_id);
CREATE INDEX IF NOT EXISTS idx_component_types_type_key ON component_types (type_key);


-- Re-enable foreign keys
PRAGMA foreign_keys=on; 