const db = require('./database');

// =================================================================================
// Component Type Operations
// =================================================================================

function getAllComponentTypes() {
    const stmt = db.prepare('SELECT id, type_key, display_name FROM component_types ORDER BY id');
    return stmt.all();
}

function renameComponentType(typeKey, newDisplayName) {
    const stmt = db.prepare('UPDATE component_types SET display_name = ?, modified_at = CURRENT_TIMESTAMP WHERE type_key = ?');
    const result = stmt.run(newDisplayName, typeKey);
    return result.changes > 0;
}


// =================================================================================
// Prompt Set Operations
// =================================================================================

function getAllPromptSets() {
    const stmt = db.prepare('SELECT id, set_key, display_name FROM prompt_sets ORDER BY id');
    return stmt.all();
}

function getPromptSetVisibility() {
    const stmt = db.prepare('SELECT prompt_set_id, component_type_id, is_visible FROM prompt_set_component_visibility');
    return stmt.all();
}

function updatePromptSetVisibility(promptSetId, componentTypeId, isVisible) {
    // This is an "UPSERT" operation. It will INSERT a new row if one doesn't exist,
    // or it will UPDATE the existing row if there's a conflict on the primary key.
    const stmt = db.prepare(`
        INSERT INTO prompt_set_component_visibility (prompt_set_id, component_type_id, is_visible)
        VALUES (?, ?, ?)
        ON CONFLICT(prompt_set_id, component_type_id) DO UPDATE SET
        is_visible = excluded.is_visible;
    `);
    const result = stmt.run(promptSetId, componentTypeId, isVisible ? 1 : 0);
    return result.changes > 0;
}


// =================================================================================
// User Component (Prompt) Operations
// =================================================================================

// Create a new user component
function createUserComponent(component) {
    const stmt = db.prepare(`
        INSERT INTO user_components (
            component_type_id,
            is_active,
            selection,
            prompt_value,
            user_value,
            is_starter
        ) VALUES (?, ?, ?, ?, ?, 0)
    `);
    const result = stmt.run(
        component.component_type_id,
        component.is_active ? 1 : 0,
        component.selection,
        component.prompt_value,
        component.user_value
    );
    return result.lastInsertRowid;
}

// Get all user components, joined with their type information
function getAllUserComponents() {
    const stmt = db.prepare(`
        SELECT
            uc.id,
            uc.component_type_id,
            ct.type_key,
            ct.display_name,
            uc.is_active,
            uc.is_starter,
            uc.selection,
            uc.prompt_value,
            uc.user_value,
            uc.created_at,
            uc.modified_at
        FROM user_components uc
        JOIN component_types ct ON uc.component_type_id = ct.id
        ORDER BY ct.id, uc.id
    `);
    return stmt.all();
}

// Get a specific user component by ID
function getUserComponent(id) {
    const stmt = db.prepare('SELECT * FROM user_components WHERE id = ?');
    return stmt.get(id);
}

// Update a user component
function updateUserComponent(id, component) {
    const allowedFields = ['is_active', 'selection', 'prompt_value', 'user_value'];
    const fieldsToUpdate = Object.keys(component).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
        return false;
    }

    const setClauses = fieldsToUpdate.map(field => `${field} = ?`);
    setClauses.push('modified_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE user_components SET ${setClauses.join(', ')} WHERE id = ?`;

    const values = fieldsToUpdate.map(field => {
        if (field === 'is_active') {
            return component[field] ? 1 : 0;
        }
        return component[field];
    });
    values.push(id);

    const stmt = db.prepare(sql);
    const result = stmt.run(...values);

    return result.changes > 0;
}

// Delete a user component
function deleteUserComponent(id) {
    const stmt = db.prepare('DELETE FROM user_components WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}

module.exports = {
    getAllComponentTypes,
    renameComponentType,
    getAllPromptSets,
    getPromptSetVisibility,
    updatePromptSetVisibility,
    createUserComponent,
    getAllUserComponents,
    getUserComponent,
    updateUserComponent,
    deleteUserComponent
}; 