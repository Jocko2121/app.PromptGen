const db = require('./database');
const backup = require('./backup');

async function createTestComponents() {
    try {
        // Start transaction
        db.prepare('BEGIN').run();

        try {
            // Create some active components
            db.prepare(`
                INSERT INTO user_components (
                    original_starter_id, component_type, is_active, 
                    selection, prompt_value, user_value
                ) VALUES 
                ('test1', 'role', 1, 'test', 'test', 'test'),
                ('test2', 'task', 1, 'test', 'test', 'test')
            `).run();

            // Create some inactive components
            db.prepare(`
                INSERT INTO user_components (
                    original_starter_id, component_type, is_active, 
                    selection, prompt_value, user_value
                ) VALUES 
                ('test3', 'role', 0, 'test', 'test', 'test'),
                ('test4', 'task', 0, 'test', 'test', 'test'),
                ('test5', 'format', 0, 'test', 'test', 'test')
            `).run();

            // Commit transaction
            db.prepare('COMMIT').run();

            return {
                success: true,
                message: 'Test components created successfully',
                data: {
                    active: 2,
                    inactive: 3
                }
            };
        } catch (error) {
            // Rollback on error
            db.prepare('ROLLBACK').run();
            throw error;
        }
    } catch (error) {
        return {
            success: false,
            error: `Error creating test components: ${error.message}`
        };
    }
}

async function cleanupDatabase() {
    try {
        // Create a backup before cleanup
        const backupResult = await backup.createBackup();
        if (!backupResult.success) {
            throw new Error('Failed to create backup before cleanup');
        }

        // Get count of inactive components before cleanup
        const beforeCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM user_components 
            WHERE is_active = 0
        `).get().count;

        // Start transaction for deletion
        db.prepare('BEGIN').run();

        try {
            // Remove inactive components
            db.prepare(`
                DELETE FROM user_components 
                WHERE is_active = 0
            `).run();

            // Commit transaction
            db.prepare('COMMIT').run();

            // Run VACUUM outside of transaction
            db.prepare('VACUUM').run();

            return {
                success: true,
                message: 'Database cleanup completed successfully',
                data: {
                    removedItems: beforeCount,
                    backupName: backupResult.backupName
                }
            };
        } catch (error) {
            // Rollback on error
            db.prepare('ROLLBACK').run();
            throw error;
        }
    } catch (error) {
        return {
            success: false,
            error: `Error during database cleanup: ${error.message}`
        };
    }
}

function getDatabaseSize() {
    try {
        // Get database file size
        const size = db.prepare(`
            SELECT page_count * page_size as size 
            FROM pragma_page_count(), pragma_page_size()
        `).get().size;

        // Get table sizes
        const tableSizes = db.prepare(`
            SELECT name, 
                   (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=t.name) as row_count
            FROM sqlite_master t
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();

        return {
            success: true,
            data: {
                totalSize: size,
                tables: tableSizes
            }
        };
    } catch (error) {
        return {
            success: false,
            error: `Error getting database size: ${error.message}`
        };
    }
}

module.exports = {
    cleanupDatabase,
    getDatabaseSize,
    createTestComponents
}; 