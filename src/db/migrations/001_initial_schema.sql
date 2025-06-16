-- Create user_components table
CREATE TABLE IF NOT EXISTS user_components (
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

-- Create app_state table
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY NOT NULL,
    state_data TEXT NOT NULL CHECK (json_valid(state_data)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create migrations table
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updating modified_at
CREATE TRIGGER IF NOT EXISTS update_user_components_modified_at
AFTER UPDATE ON user_components
BEGIN
    UPDATE user_components SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create required indexes
CREATE INDEX IF NOT EXISTS idx_user_components_type ON user_components(component_type);
CREATE INDEX IF NOT EXISTS idx_user_components_starter_id ON user_components(original_starter_id);
CREATE INDEX IF NOT EXISTS idx_user_components_created ON user_components(created_at);
CREATE INDEX IF NOT EXISTS idx_user_components_modified ON user_components(modified_at);
CREATE INDEX IF NOT EXISTS idx_user_components_type_active ON user_components(component_type, is_active); 