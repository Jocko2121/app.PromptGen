const db = require('./database');

// Helper function to run operations in a transaction
function runInTransaction(operations) {
    const transaction = db.transaction((...args) => {
        return operations(...args);
    });
    return transaction;
}

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
// User Component (Prompt) Operations
// =================================================================================

// Create a new user component
function createUserComponent(component) {
    return runInTransaction(() => {
        try {
            console.log('Creating user component with data:', component);
            const stmt = db.prepare(`
                INSERT INTO user_components (
                    component_type_id,
                    is_active,
                    selection,
                    prompt_value,
                    user_value
                ) VALUES (?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
                component.component_type_id,
                component.is_active ? 1 : 0,
                component.selection,
                component.prompt_value,
                component.user_value
            );
            console.log('Database operation result:', result);
            return result.lastInsertRowid;
        } catch (error) {
            console.error('Database error in createUserComponent:', error);
            throw error;
        }
    });
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
        ORDER BY uc.created_at DESC
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
    return runInTransaction(() => {
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
            component.is_active ? 1 : 0,
            component.selection,
            component.prompt_value,
            component.user_value,
            id
        );

        return result.changes > 0;
    });
}

// Delete a user component
function deleteUserComponent(id) {
    return runInTransaction(() => {
        const stmt = db.prepare('DELETE FROM user_components WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    });
}

module.exports = {
    runInTransaction,
    getAllComponentTypes,
    renameComponentType,
    createUserComponent,
    getAllUserComponents,
    getUserComponent,
    updateUserComponent,
    deleteUserComponent
}; 