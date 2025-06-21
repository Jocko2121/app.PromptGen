-- Create a table to store the different prompt sets
CREATE TABLE IF NOT EXISTS prompt_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to update the modified_at timestamp for prompt_sets
CREATE TRIGGER IF NOT EXISTS update_prompt_sets_modified_at
AFTER UPDATE ON prompt_sets
FOR EACH ROW
BEGIN
    UPDATE prompt_sets SET modified_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Create the linking table to manage visibility of component types within each prompt set
CREATE TABLE IF NOT EXISTS prompt_set_component_visibility (
    prompt_set_id INTEGER NOT NULL,
    component_type_id INTEGER NOT NULL,
    is_visible INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (prompt_set_id, component_type_id),
    FOREIGN KEY (prompt_set_id) REFERENCES prompt_sets(id) ON DELETE CASCADE,
    FOREIGN KEY (component_type_id) REFERENCES component_types(id) ON DELETE CASCADE
);

-- Insert the default prompt sets that the application currently uses
INSERT INTO prompt_sets (set_key, display_name) VALUES
('custom_build', 'Custom Build'),
('blog_post', 'Blog Post');

-- Populate the visibility table with default values for every existing component type.
-- This ensures that for the two default prompt sets, all component types are visible by default.
INSERT INTO prompt_set_component_visibility (prompt_set_id, component_type_id, is_visible)
SELECT
    ps.id,
    ct.id,
    1 -- is_visible = true
FROM
    prompt_sets ps,
    component_types ct
WHERE
    ps.set_key IN ('custom_build', 'blog_post'); 