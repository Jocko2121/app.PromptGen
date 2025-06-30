const db = require('./database');
const starterComponents = require('./starter-components');

/**
 * Creates project-based database tables.
 * This adds the new project-centric structure while keeping existing tables.
 */
function createProjectTables() {
    console.log('[Initialization] Creating project-based database tables...');

    // Projects table - main project container
    db.prepare(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
    `).run();

    // Project-scoped components (replaces global user_components)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            component_type_id INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT 1 NOT NULL,
            is_starter BOOLEAN DEFAULT 0 NOT NULL,
            selection TEXT NOT NULL,
            prompt_value TEXT,
            user_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (component_type_id) REFERENCES component_types(id)
        )
    `).run();

    // Project-scoped prompt sets (replaces global prompt_sets)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_prompt_sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            set_key TEXT NOT NULL,
            display_name TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 0 NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            UNIQUE(project_id, set_key)
        )
    `).run();

    // Project-scoped visibility settings
    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_prompt_set_visibility (
            project_id INTEGER NOT NULL,
            prompt_set_id INTEGER NOT NULL,
            component_type_id INTEGER NOT NULL,
            is_visible BOOLEAN DEFAULT 1 NOT NULL,
            PRIMARY KEY (project_id, prompt_set_id, component_type_id),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (prompt_set_id) REFERENCES project_prompt_sets(id) ON DELETE CASCADE,
            FOREIGN KEY (component_type_id) REFERENCES component_types(id)
        )
    `).run();

    // Project content blocks (userOutline, finalPrompt, etc.)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_content_blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            block_type TEXT NOT NULL,
            active_draft_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            UNIQUE(project_id, block_type)
        )
    `).run();

    // Project drafts for content blocks
    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_drafts (
            id TEXT PRIMARY KEY,
            content_block_id INTEGER NOT NULL,
            content TEXT DEFAULT '',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (content_block_id) REFERENCES project_content_blocks(id) ON DELETE CASCADE
        )
    `).run();

    // Project settings (text transformer, UI state, etc.)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS project_settings (
            project_id INTEGER PRIMARY KEY,
            text_transformer_active_action TEXT DEFAULT 'analyze',
            text_transformer_options TEXT DEFAULT '{}',
            ui_settings TEXT DEFAULT '{}',
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    `).run();

    // Create indexes for performance
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_components_project_id ON project_components (project_id)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_components_type_id ON project_components (component_type_id)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_prompt_sets_project_id ON project_prompt_sets (project_id)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_content_blocks_project_id ON project_content_blocks (project_id)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_project_drafts_content_block_id ON project_drafts (content_block_id)`).run();

    // Create triggers for modified_at timestamps
    db.prepare(`
        CREATE TRIGGER IF NOT EXISTS update_projects_modified_at
        AFTER UPDATE ON projects
        FOR EACH ROW
        BEGIN
            UPDATE projects SET modified_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END
    `).run();

    db.prepare(`
        CREATE TRIGGER IF NOT EXISTS update_project_components_modified_at
        AFTER UPDATE ON project_components
        FOR EACH ROW
        BEGIN
            UPDATE project_components SET modified_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END
    `).run();

    db.prepare(`
        CREATE TRIGGER IF NOT EXISTS update_project_prompt_sets_modified_at
        AFTER UPDATE ON project_prompt_sets
        FOR EACH ROW
        BEGIN
            UPDATE project_prompt_sets SET modified_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END
    `).run();

    console.log('[Initialization] Project-based database tables created successfully.');
}

/**
 * Creates the Default Project and populates it with starter data.
 * This migrates all existing functionality to be project-scoped.
 */
function createDefaultProject() {
    console.log('[Initialization] Creating Default Project...');

    // Create Default Project
    const insertProject = db.prepare(`
        INSERT INTO projects (id, name, description) 
        VALUES (1, 'Default Project', 'Default project containing starter components')
    `);
    
    try {
        insertProject.run();
        console.log('[Initialization] Default Project created with ID=1');
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('[Initialization] Default Project already exists, skipping creation.');
        } else {
            throw error;
        }
    }

    // Create default prompt sets for the project
    const insertPromptSet = db.prepare(`
        INSERT OR IGNORE INTO project_prompt_sets (project_id, set_key, display_name, is_active) 
        VALUES (?, ?, ?, ?)
    `);
    
    insertPromptSet.run(1, 'custom_build', 'Custom Build', 1); // Active by default
    insertPromptSet.run(1, 'blog_post', 'Blog Post', 0);
    console.log('[Initialization] Default prompt sets created for Default Project');

    // Create default content blocks
    const now = Date.now();
    const insertContentBlock = db.prepare(`
        INSERT OR IGNORE INTO project_content_blocks (project_id, block_type, active_draft_id) 
        VALUES (?, ?, ?)
    `);
    
    const contentBlocks = [
        { type: 'userOutline', draftId: `draft-${now+1}` },
        { type: 'finalPrompt', draftId: `draft-${now+2}` },
        { type: 'articleWorkspace', draftId: `draft-${now+3}` },
        { type: 'textTransformerInput', draftId: `draft-${now+4}` },
        { type: 'textTransformerOutput', draftId: `draft-${now+5}` }
    ];

    contentBlocks.forEach(block => {
        insertContentBlock.run(1, block.type, block.draftId);
    });
    console.log('[Initialization] Default content blocks created for Default Project');

    // Create default drafts for content blocks
    const getContentBlockId = db.prepare(`
        SELECT id FROM project_content_blocks 
        WHERE project_id = ? AND block_type = ?
    `);
    
    const insertDraft = db.prepare(`
        INSERT OR IGNORE INTO project_drafts (id, content_block_id, content) 
        VALUES (?, ?, '')
    `);

    contentBlocks.forEach(block => {
        const contentBlockRow = getContentBlockId.get(1, block.type);
        if (contentBlockRow) {
            insertDraft.run(block.draftId, contentBlockRow.id);
        }
    });
    console.log('[Initialization] Default drafts created for content blocks');

    // Create default project settings
    const insertSettings = db.prepare(`
        INSERT OR IGNORE INTO project_settings (project_id, text_transformer_active_action, text_transformer_options, ui_settings) 
        VALUES (1, 'analyze', '{"rewrite":{"activeOption":"casual"},"analyze":{"activeOption":"proofread"}}', '{}')
    `);
    insertSettings.run();
    console.log('[Initialization] Default project settings created');
}

/**
 * Seeds the Default Project with starter components.
 * This is the project-scoped version of the original component seeding.
 */
function seedDefaultProjectComponents() {
    // Check if project components are already populated
    const row = db.prepare('SELECT COUNT(*) as count FROM project_components WHERE project_id = 1').get();
    if (row.count > 0) {
        console.log('[Initialization] Default Project components already populated. No action needed.');
        return;
    }
    console.log('[Initialization] Seeding Default Project with starter components...');

    const getTypeStmt = db.prepare('SELECT id FROM component_types WHERE type_key = ?');
    const insertComponentStmt = db.prepare(`
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

    // Get prompt set IDs for visibility setup
    const getPromptSetIds = db.prepare(`
        SELECT id, set_key FROM project_prompt_sets WHERE project_id = 1
    `).all();

    const insertVisibility = db.prepare(`
        INSERT OR IGNORE INTO project_prompt_set_visibility (project_id, prompt_set_id, component_type_id, is_visible) 
        VALUES (?, ?, ?, ?)
    `);

    const seedProjectComponents = db.transaction(() => {
        console.log('[Initialization] Starting Default Project component seeding transaction.');
        
        for (const [typeKey, componentData] of Object.entries(starterComponents)) {
            // Get the component type ID
            const typeRow = getTypeStmt.get(typeKey);
            if (!typeRow) {
                console.error(`[Initialization] CRITICAL: Component type '${typeKey}' not found in database. Halting seed.`);
                throw new Error(`Component type '${typeKey}' not found. Migrations may have failed.`);
            }
            const componentTypeId = typeRow.id;

            // Insert components for this type
            if (componentData.prompts) {
                for (const [selection, promptValue] of Object.entries(componentData.prompts)) {
                    insertComponentStmt.run(
                        1, // project_id = 1 (Default Project)
                        componentTypeId,
                        1, // is_active
                        selection,
                        promptValue,
                        '', // user_value (empty by default)
                        1   // is_starter (true)
                    );
                }
            } else {
                // Handle components that don't have predefined prompts (e.g., context, constraints)
                insertComponentStmt.run(
                    1, // project_id = 1 (Default Project)
                    componentTypeId,
                    1, // is_active
                    'default', // selection
                    '', // prompt_value
                    '', // user_value
                    1 // is_starter
                );
            }

            // Set up visibility for all prompt sets (all components visible by default)
            getPromptSetIds.forEach(promptSet => {
                insertVisibility.run(1, promptSet.id, componentTypeId, 1); // is_visible = true
            });
        }
        
        console.log('[Initialization] Default Project component seeding transaction completed.');
    });

    try {
        seedProjectComponents();
        console.log('[Initialization] Default Project starter components inserted successfully.');
    } catch (error) {
        console.error('[Initialization] Failed to seed Default Project components:', error);
        throw error;
    }
}

/**
 * Seeds the database with starter components.
 * This function will only run if the user_components table is empty.
 * It assumes the component_types table has already been populated by migrations.
 */
async function initializeDatabaseIfNeeded() {
    // Create project-based tables first
    createProjectTables();
    
    // Create and populate Default Project
    createDefaultProject();
    seedDefaultProjectComponents();

    console.log('[Initialization] Database initialization completed successfully');
}

module.exports = { initializeDatabaseIfNeeded }; 