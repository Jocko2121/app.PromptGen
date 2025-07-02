-- 006_add_component_types.sql

-- =================================================================================
-- Create the component_types table
-- This table stores the master list of component groups.
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
-- Insert the starter component types
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
-- Create indexes for better performance
-- =================================================================================
CREATE INDEX IF NOT EXISTS idx_component_types_type_key ON component_types (type_key); 