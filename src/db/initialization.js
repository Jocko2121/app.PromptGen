const db = require('./database');
const starterComponents = require('./starter-components');

/**
 * Seeds the database with starter components.
 * This function will only run if the user_components table is empty.
 * It assumes the component_types table has already been populated by migrations.
 */
async function initializeDatabaseIfNeeded() {
    // Check if the user_components table is already populated.
    const row = db.prepare('SELECT COUNT(*) as count FROM user_components').get();
    if (row.count > 0) {
        console.log('[Initialization] user_components table already populated. No action needed.');
        return;
    }
    console.log('[Initialization] user_components table is empty. Seeding database...');

    const getTypeStmt = db.prepare('SELECT id FROM component_types WHERE type_key = ?');
    const insertComponentStmt = db.prepare(`
        INSERT INTO user_components (
            component_type_id,
            is_active,
            selection,
            prompt_value,
            user_value,
            is_starter
        ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const seedDatabase = db.transaction(() => {
        console.log('[Initialization] Starting database seeding transaction.');
        for (const [typeKey, componentData] of Object.entries(starterComponents)) {
            // Step 1: Get the ID for the component type (must exist from migrations)
            const typeRow = getTypeStmt.get(typeKey);

            if (!typeRow) {
                // This indicates a severe problem, as migrations should have created this.
                console.error(`[Initialization] CRITICAL: Component type '${typeKey}' not found in database. Halting seed.`);
                throw new Error(`Component type '${typeKey}' not found. Migrations may have failed.`);
            }
            const componentTypeId = typeRow.id;

            // Step 2: Insert the associated components (prompts)
            if (componentData.prompts) {
                for (const [selection, promptValue] of Object.entries(componentData.prompts)) {
                    insertComponentStmt.run(
                        componentTypeId,
                        1, // is_active
                        selection,
                        promptValue,
                        '', // user_value (empty by default)
                        1   // is_starter (true)
                    );
                }
            }
        }
        console.log('[Initialization] Database seeding transaction completed.');
    });

    try {
        seedDatabase();
        console.log('[Initialization] Starter components inserted successfully.');
    } catch (error) {
        console.error('[Initialization] Failed to seed database:', error);
        throw error;
    }
}

module.exports = { initializeDatabaseIfNeeded }; 