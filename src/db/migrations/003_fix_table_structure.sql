-- Drop existing indexes
DROP INDEX IF EXISTS idx_user_components_type;
DROP INDEX IF EXISTS idx_user_components_starter_id;
DROP INDEX IF EXISTS idx_user_components_created;
DROP INDEX IF EXISTS idx_user_components_modified;
DROP INDEX IF EXISTS idx_user_components_type_active;

-- Create new table with correct constraints
CREATE TABLE user_components_new (
    id INTEGER PRIMARY KEY NOT NULL,
    original_starter_id TEXT NOT NULL,
    component_type TEXT NOT NULL,
    is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
    selection TEXT NOT NULL,
    prompt_value TEXT NOT NULL,
    user_value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table
INSERT INTO user_components_new 
SELECT * FROM user_components;

-- Drop old table and rename new table
DROP TABLE user_components;
ALTER TABLE user_components_new RENAME TO user_components;

-- Recreate indexes
CREATE INDEX idx_user_components_type ON user_components(component_type);
CREATE INDEX idx_user_components_starter_id ON user_components(original_starter_id);
CREATE INDEX idx_user_components_created ON user_components(created_at);
CREATE INDEX idx_user_components_modified ON user_components(modified_at);
CREATE INDEX idx_user_components_type_active ON user_components(component_type, is_active);

-- Recreate trigger
DROP TRIGGER IF EXISTS update_user_components_modified_at;
CREATE TRIGGER update_user_components_modified_at
AFTER UPDATE ON user_components
BEGIN
    UPDATE user_components SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 