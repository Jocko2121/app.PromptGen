const db = require('./database');

// Create a new user component
function createUserComponent(component) {
    const stmt = db.prepare(`
        INSERT INTO user_components (
            original_starter_id,
            component_type,
            is_active,
            selection,
            prompt_value,
            user_value
        ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        component.original_starter_id,
        component.component_type,
        component.is_active ?? true,
        component.selection,
        component.prompt_value,
        component.user_value
    );

    return result.lastInsertRowid;
}

// Get all user components
function getAllUserComponents() {
    const stmt = db.prepare('SELECT * FROM user_components ORDER BY created_at DESC');
    return stmt.all();
}

// Get a specific user component by ID
function getUserComponent(id) {
    const stmt = db.prepare('SELECT * FROM user_components WHERE id = ?');
    return stmt.get(id);
}

// Update a user component
function updateUserComponent(id, component) {
    const stmt = db.prepare(`
        UPDATE user_components 
        SET 
            is_active = ?,
            selection = ?,
            prompt_value = ?,
            user_value = ?,
            modified_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);

    const result = stmt.run(
        component.is_active,
        component.selection,
        component.prompt_value,
        component.user_value,
        id
    );

    return result.changes > 0;
}

// Delete a user component
function deleteUserComponent(id) {
    const stmt = db.prepare('DELETE FROM user_components WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

// Save application state
function saveAppState(state) {
    const stmt = db.prepare(`
        INSERT INTO app_state (id, state_data) 
        VALUES (1, ?) 
        ON CONFLICT(id) 
        DO UPDATE SET 
            state_data = excluded.state_data,
            last_modified = CURRENT_TIMESTAMP
    `);

    const result = stmt.run(JSON.stringify(state));
    return result.changes > 0;
}

// Load application state
function loadAppState() {
    const stmt = db.prepare('SELECT state_data FROM app_state WHERE id = 1');
    const result = stmt.get();
    return result ? JSON.parse(result.state_data) : null;
}

module.exports = {
    createUserComponent,
    getAllUserComponents,
    getUserComponent,
    updateUserComponent,
    deleteUserComponent,
    saveAppState,
    loadAppState
}; 