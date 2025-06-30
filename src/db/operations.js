const db = require('./database');

// =================================================================================
// Project Operations
// =================================================================================

function getProject(projectId) {
    const stmt = db.prepare('SELECT id, name, description, created_at, modified_at FROM projects WHERE id = ?');
    return stmt.get(projectId);
}

function getAllProjects() {
    const stmt = db.prepare('SELECT id, name, description, created_at, modified_at FROM projects ORDER BY modified_at DESC');
    return stmt.all();
}

function createProject(name, description = '') {
    const stmt = db.prepare(`
        INSERT INTO projects (name, description) 
        VALUES (?, ?)
    `);
    const result = stmt.run(name, description);
    return result.lastInsertRowid;
}

function updateProject(projectId, updates) {
    const allowedFields = ['name', 'description'];
    const fieldsToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
        return false;
    }

    const setClauses = fieldsToUpdate.map(field => `${field} = ?`);
    setClauses.push('modified_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE projects SET ${setClauses.join(', ')} WHERE id = ?`;
    const values = fieldsToUpdate.map(field => updates[field]);
    values.push(projectId);

    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    return result.changes > 0;
}

function deleteProject(projectId) {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(projectId);
    return result.changes > 0;
}

// Initialize new project with required structure
function initializeNewProject(projectId) {
    const transaction = db.transaction(() => {
        console.log(`[initializeNewProject] Starting initialization for project ${projectId}`);
        
        // Create default prompt sets for this project
        try {
            const insertPromptSet = db.prepare(`
                INSERT INTO project_prompt_sets (project_id, set_key, display_name, is_active)
                VALUES (?, ?, ?, ?)
            `);
            
            insertPromptSet.run(projectId, 'custom_build', 'Custom Build', 1);
            insertPromptSet.run(projectId, 'blog_post', 'Blog Post', 0);
            console.log(`[initializeNewProject] Prompt sets created`);
        } catch (error) {
            console.error(`[initializeNewProject] Error creating prompt sets:`, error);
            throw error;
        }

        // Create content blocks for this project
        const now = Date.now();
        const contentBlocks = [
            { type: 'userOutline', draftId: `draft_${projectId}_${now+1}` },
            { type: 'finalPrompt', draftId: `draft_${projectId}_${now+2}` },
            { type: 'articleWorkspace', draftId: `draft_${projectId}_${now+3}` },
            { type: 'textTransformerInput', draftId: `draft_${projectId}_${now+4}` },
            { type: 'textTransformerOutput', draftId: `draft_${projectId}_${now+5}` }
        ];

        try {
            const insertContentBlock = db.prepare(`
                INSERT INTO project_content_blocks (project_id, block_type, active_draft_id)
                VALUES (?, ?, ?)
            `);

            contentBlocks.forEach(block => {
                insertContentBlock.run(projectId, block.type, block.draftId);
            });
            console.log(`[initializeNewProject] Content blocks created`);
        } catch (error) {
            console.error(`[initializeNewProject] Error creating content blocks:`, error);
            throw error;
        }

        // Create initial drafts for content blocks
        try {
            const getContentBlockId = db.prepare(`
                SELECT id FROM project_content_blocks 
                WHERE project_id = ? AND block_type = ?
            `);
            
            const insertDraft = db.prepare(`
                INSERT INTO project_drafts (id, content_block_id, content) 
                VALUES (?, ?, ?)
            `);

            // Use the same contentBlocks array for consistency
            contentBlocks.forEach(block => {
                const contentBlockRow = getContentBlockId.get(projectId, block.type);
                if (contentBlockRow) {
                    insertDraft.run(block.draftId, contentBlockRow.id, '');
                }
            });
            console.log(`[initializeNewProject] Drafts created`);
        } catch (error) {
            console.error(`[initializeNewProject] Error creating drafts:`, error);
            throw error;
        }

        // Create default project settings
        try {
            const insertSettings = db.prepare(`
                INSERT INTO project_settings (project_id, text_transformer_active_action, text_transformer_options, ui_settings) 
                VALUES (?, ?, ?, ?)
            `);
            insertSettings.run(projectId, 'analyze', '{"rewrite":{"activeOption":"casual"},"analyze":{"activeOption":"proofread"}}', '{}');
            console.log(`[initializeNewProject] Settings created`);
        } catch (error) {
            console.error(`[initializeNewProject] Error creating settings:`, error);
            throw error;
        }
    });

    transaction();
    return true;
}

// =================================================================================
// Project Component Operations
// =================================================================================

function getAllProjectComponents(projectId) {
    const stmt = db.prepare(`
        SELECT
            pc.id,
            pc.component_type_id,
            ct.type_key,
            ct.display_name,
            pc.is_active,
            pc.is_starter,
            pc.selection,
            pc.prompt_value,
            pc.user_value,
            pc.created_at,
            pc.modified_at
        FROM project_components pc
        JOIN component_types ct ON pc.component_type_id = ct.id
        WHERE pc.project_id = ?
        ORDER BY ct.id, pc.id
    `);
    return stmt.all(projectId);
}

function getProjectComponent(projectId, componentId) {
    const stmt = db.prepare('SELECT * FROM project_components WHERE project_id = ? AND id = ?');
    return stmt.get(projectId, componentId);
}

function createProjectComponent(projectId, component) {
    const stmt = db.prepare(`
        INSERT INTO project_components (
            project_id,
            component_type_id,
            is_active,
            selection,
            prompt_value,
            user_value,
            is_starter
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
        projectId,
        component.component_type_id,
        component.is_active ? 1 : 0,
        component.selection,
        component.prompt_value,
        component.user_value,
        component.is_starter ? 1 : 0
    );
    return result.lastInsertRowid;
}

function updateProjectComponent(projectId, componentId, component) {
    const allowedFields = ['is_active', 'selection', 'prompt_value', 'user_value'];
    const fieldsToUpdate = Object.keys(component).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
        return false;
    }

    const setClauses = fieldsToUpdate.map(field => `${field} = ?`);
    setClauses.push('modified_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE project_components SET ${setClauses.join(', ')} WHERE project_id = ? AND id = ?`;

    const values = fieldsToUpdate.map(field => {
        if (field === 'is_active') {
            return component[field] ? 1 : 0;
        }
        return component[field];
    });
    values.push(projectId, componentId);

    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    return result.changes > 0;
}

function deleteProjectComponent(projectId, componentId) {
    const stmt = db.prepare('DELETE FROM project_components WHERE project_id = ? AND id = ?');
    const result = stmt.run(projectId, componentId);
    return result.changes > 0;
}

// =================================================================================
// Project Prompt Set Operations
// =================================================================================

function getAllProjectPromptSets(projectId) {
    const stmt = db.prepare(`
        SELECT id, set_key, display_name, is_active, created_at, modified_at 
        FROM project_prompt_sets 
        WHERE project_id = ?
        ORDER BY id
    `);
    return stmt.all(projectId);
}

function getProjectPromptSetVisibility(projectId) {
    const stmt = db.prepare(`
        SELECT prompt_set_id, component_type_id, is_visible 
        FROM project_prompt_set_visibility 
        WHERE project_id = ?
    `);
    return stmt.all(projectId);
}

function updateProjectPromptSetVisibility(projectId, promptSetId, componentTypeId, isVisible) {
    const stmt = db.prepare(`
        INSERT INTO project_prompt_set_visibility (project_id, prompt_set_id, component_type_id, is_visible)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(project_id, prompt_set_id, component_type_id) DO UPDATE SET
        is_visible = excluded.is_visible
    `);
    const result = stmt.run(projectId, promptSetId, componentTypeId, isVisible ? 1 : 0);
    return result.changes > 0;
}

function createProjectPromptSet(projectId, promptSet) {
    const stmt = db.prepare(`
        INSERT INTO project_prompt_sets (project_id, set_key, display_name, is_active)
        VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
        projectId,
        promptSet.set_key,
        promptSet.display_name,
        promptSet.is_active ? 1 : 0
    );
    return result.lastInsertRowid;
}

function updateProjectPromptSet(projectId, promptSetId, updates) {
    const allowedFields = ['display_name', 'is_active'];
    const fieldsToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
        return false;
    }

    const setClauses = fieldsToUpdate.map(field => `${field} = ?`);
    setClauses.push('modified_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE project_prompt_sets SET ${setClauses.join(', ')} WHERE project_id = ? AND id = ?`;

    const values = fieldsToUpdate.map(field => {
        if (field === 'is_active') {
            return updates[field] ? 1 : 0;
        }
        return updates[field];
    });
    values.push(projectId, promptSetId);

    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    return result.changes > 0;
}

// =================================================================================
// Project Content Block Operations
// =================================================================================

function getProjectContentBlocks(projectId) {
    const stmt = db.prepare(`
        SELECT id, block_type, active_draft_id, created_at
        FROM project_content_blocks
        WHERE project_id = ?
        ORDER BY block_type
    `);
    return stmt.all(projectId);
}

function getProjectDrafts(projectId, blockType) {
    const stmt = db.prepare(`
        SELECT pd.id, pd.content, pd.timestamp
        FROM project_drafts pd
        JOIN project_content_blocks pcb ON pd.content_block_id = pcb.id
        WHERE pcb.project_id = ? AND pcb.block_type = ?
        ORDER BY pd.timestamp DESC
    `);
    return stmt.all(projectId, blockType);
}

function createProjectDraft(projectId, blockType, draftId, content) {
    // First get the content block ID
    const getBlockStmt = db.prepare(`
        SELECT id FROM project_content_blocks 
        WHERE project_id = ? AND block_type = ?
    `);
    const block = getBlockStmt.get(projectId, blockType);
    
    if (!block) {
        throw new Error(`Content block '${blockType}' not found for project ${projectId}`);
    }

    // Insert the draft
    const insertDraftStmt = db.prepare(`
        INSERT INTO project_drafts (id, content_block_id, content)
        VALUES (?, ?, ?)
    `);
    insertDraftStmt.run(draftId, block.id, content);

    // Update the active draft ID
    const updateActiveStmt = db.prepare(`
        UPDATE project_content_blocks 
        SET active_draft_id = ? 
        WHERE project_id = ? AND block_type = ?
    `);
    updateActiveStmt.run(draftId, projectId, blockType);

    return draftId;
}

function updateProjectDraft(draftId, content) {
    const stmt = db.prepare(`
        UPDATE project_drafts 
        SET content = ?, timestamp = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    const result = stmt.run(content, draftId);
    return result.changes > 0;
}

function setActiveProjectDraft(projectId, blockType, draftId) {
    const stmt = db.prepare(`
        UPDATE project_content_blocks 
        SET active_draft_id = ? 
        WHERE project_id = ? AND block_type = ?
    `);
    const result = stmt.run(draftId, projectId, blockType);
    return result.changes > 0;
}

// =================================================================================
// Project Settings Operations
// =================================================================================

function getProjectSettings(projectId) {
    const stmt = db.prepare(`
        SELECT text_transformer_active_action, text_transformer_options, ui_settings
        FROM project_settings 
        WHERE project_id = ?
    `);
    return stmt.get(projectId);
}

function updateProjectSettings(projectId, settings) {
    const allowedFields = ['text_transformer_active_action', 'text_transformer_options', 'ui_settings'];
    const fieldsToUpdate = Object.keys(settings).filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
        return false;
    }

    const setClauses = fieldsToUpdate.map(field => `${field} = ?`);
    const sql = `UPDATE project_settings SET ${setClauses.join(', ')} WHERE project_id = ?`;

    const values = fieldsToUpdate.map(field => settings[field]);
    values.push(projectId);

    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    return result.changes > 0;
}

// =================================================================================
// Legacy Component Type Operations (unchanged)
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
// Legacy Prompt Set Operations (unchanged)
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
// Legacy User Component Operations (unchanged)
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
    // Project operations
    getProject,
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    initializeNewProject,
    
    // Project component operations
    getAllProjectComponents,
    getProjectComponent,
    createProjectComponent,
    updateProjectComponent,
    deleteProjectComponent,
    
    // Project prompt set operations
    getAllProjectPromptSets,
    getProjectPromptSetVisibility,
    updateProjectPromptSetVisibility,
    createProjectPromptSet,
    updateProjectPromptSet,
    
    // Project content block operations
    getProjectContentBlocks,
    getProjectDrafts,
    createProjectDraft,
    updateProjectDraft,
    setActiveProjectDraft,
    
    // Project settings operations
    getProjectSettings,
    updateProjectSettings,
    
    // Legacy operations (unchanged)
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