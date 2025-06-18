const db = require('./database');
const starterComponents = require('./starter-components');

/**
 * Insert starter components into the user_components table if it is empty.
 */
async function initializeDatabaseIfNeeded() {
    // Check if user_components table is empty
    const row = db.prepare('SELECT COUNT(*) as count FROM user_components').get();
    if (row.count > 0) {
        console.log('[Initialization] user_components table already populated. No action needed.');
        return;
    }
    console.log('[Initialization] user_components table is empty. Inserting starter components...');

    const insertStmt = db.prepare(`
        INSERT INTO user_components (
            component_type,
            is_active,
            selection,
            prompt_value,
            user_value,
            is_starter
        ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((components) => {
        for (const [componentType, componentData] of Object.entries(components)) {
            // If the component has prompts, insert each as a separate row
            if (componentData.prompts) {
                for (const [selection, promptValue] of Object.entries(componentData.prompts)) {
                    insertStmt.run(
                        componentType,
                        1, // is_active
                        selection,
                        promptValue,
                        '', // user_value (empty by default)
                        1  // is_starter (true)
                    );
                }
            } else {
                // For context/constraints or other non-prompt components
                insertStmt.run(
                    componentType,
                    1,
                    'default',
                    '',
                    '',
                    1 // is_starter (true)
                );
            }
        }
    });

    insertMany(starterComponents);
    console.log('[Initialization] Starter components inserted into user_components table.');
}

module.exports = { initializeDatabaseIfNeeded }; 