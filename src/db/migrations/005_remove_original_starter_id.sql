-- Migration: Remove original_starter_id column from user_components

-- 1. Create new table with correct schema (id INTEGER PRIMARY KEY)
CREATE TABLE user_components_new (
    id INTEGER PRIMARY KEY NOT NULL,
    component_type TEXT NOT NULL,
    is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
    selection TEXT NOT NULL,
    prompt_value TEXT NOT NULL,
    user_value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_starter INTEGER NOT NULL DEFAULT 0
);

-- 2. Copy data from old table (preserving IDs)
INSERT INTO user_components_new (id, component_type, is_active, selection, prompt_value, user_value, created_at, modified_at, is_starter)
SELECT id, component_type, is_active, selection, prompt_value, user_value, created_at, modified_at, is_starter FROM user_components;

-- 3. Drop old table and rename new table
DROP TABLE user_components;
ALTER TABLE user_components_new RENAME TO user_components;

-- 4. Recreate indexes
CREATE INDEX idx_user_components_type ON user_components(component_type);
CREATE INDEX idx_user_components_created ON user_components(created_at);
CREATE INDEX idx_user_components_modified ON user_components(modified_at);
CREATE INDEX idx_user_components_type_active ON user_components(component_type, is_active);

-- 5. Recreate trigger
DROP TRIGGER IF EXISTS update_user_components_modified_at;
CREATE TRIGGER update_user_components_modified_at
AFTER UPDATE ON user_components
BEGIN
    UPDATE user_components SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 