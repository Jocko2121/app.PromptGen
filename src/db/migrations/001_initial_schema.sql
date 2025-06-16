-- Create user_components table with constraints
CREATE TABLE IF NOT EXISTS user_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_starter_id TEXT NOT NULL,
    component_type TEXT NOT NULL CHECK (component_type IN ('role', 'task', 'job', 'audiencePro', 'audienceSilly', 'format', 'tone', 'length', 'pov', 'context', 'constraints')),
    is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
    selection TEXT NOT NULL,
    prompt_value TEXT NOT NULL,
    user_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(original_starter_id, component_type)
);

-- Create app_state table with constraints
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state_data TEXT NOT NULL CHECK (json_valid(state_data)),
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for modified_at
CREATE TRIGGER IF NOT EXISTS update_user_components_timestamp 
AFTER UPDATE ON user_components
BEGIN
    UPDATE user_components SET modified_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END; 