const db = require('./database');

// Database integrity check functions
function checkTableStructure() {
    try {
        // Get all tables
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        const requiredTables = ['user_components', 'app_state', 'migrations'];
        
        // Check if all required tables exist
        const missingTables = requiredTables.filter(table => 
            !tables.some(t => t.name === table)
        );
        
        if (missingTables.length > 0) {
            return {
                valid: false,
                error: `Missing required tables: ${missingTables.join(', ')}`
            };
        }

        // Check user_components table structure
        const userComponentsColumns = db.prepare("PRAGMA table_info(user_components)").all();
        const requiredColumns = [
            { name: 'id', type: 'INTEGER', notnull: 1 },
            { name: 'original_starter_id', type: 'TEXT', notnull: 1 },
            { name: 'component_type', type: 'TEXT', notnull: 1 },
            { name: 'is_active', type: 'INTEGER', notnull: 1 },
            { name: 'selection', type: 'TEXT', notnull: 1 },
            { name: 'prompt_value', type: 'TEXT', notnull: 1 },
            { name: 'user_value', type: 'TEXT', notnull: 1 },
            { name: 'created_at', type: 'TIMESTAMP', notnull: 1 },
            { name: 'modified_at', type: 'TIMESTAMP', notnull: 1 }
        ];

        for (const required of requiredColumns) {
            const column = userComponentsColumns.find(c => c.name === required.name);
            if (!column) {
                return {
                    valid: false,
                    error: `Missing column in user_components: ${required.name}`
                };
            }
            if (column.type.toUpperCase() !== required.type.toUpperCase()) {
                return {
                    valid: false,
                    error: `Invalid type for column ${required.name}: expected ${required.type}, got ${column.type}`
                };
            }
            // Skip notnull check for id INTEGER PRIMARY KEY due to SQLite behavior
            if (required.name === 'id' && required.type.toUpperCase() === 'INTEGER') {
                continue;
            }
            if (column.notnull !== required.notnull) {
                return {
                    valid: false,
                    error: `Invalid notnull constraint for column ${required.name}`
                };
            }
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: `Error checking table structure: ${error.message}`
        };
    }
}

function checkDataIntegrity() {
    try {
        // Check for invalid component_type values
        const invalidTypes = db.prepare(`
            SELECT id, component_type 
            FROM user_components 
            WHERE component_type NOT IN (
                'role', 'task', 'job', 'audiencePro', 'audienceSilly', 
                'format', 'tone', 'length', 'pov', 'context', 'constraints'
            )
        `).all();

        if (invalidTypes.length > 0) {
            return {
                valid: false,
                error: `Found ${invalidTypes.length} records with invalid component_type`
            };
        }

        // Check for invalid is_active values
        const invalidActive = db.prepare(`
            SELECT id, is_active 
            FROM user_components 
            WHERE is_active NOT IN (0, 1)
        `).all();

        if (invalidActive.length > 0) {
            return {
                valid: false,
                error: `Found ${invalidActive.length} records with invalid is_active value`
            };
        }

        // Check for invalid JSON in app_state
        const invalidJson = db.prepare(`
            SELECT id 
            FROM app_state 
            WHERE json_valid(state_data) = 0
        `).all();

        if (invalidJson.length > 0) {
            return {
                valid: false,
                error: `Found ${invalidJson.length} records with invalid JSON in app_state`
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: `Error checking data integrity: ${error.message}`
        };
    }
}

function checkIndexIntegrity() {
    try {
        // Get all indexes
        const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all();
        
        // Check if required indexes exist
        const requiredIndexes = [
            'idx_user_components_type',
            'idx_user_components_starter_id',
            'idx_user_components_created',
            'idx_user_components_modified'
        ];

        const missingIndexes = requiredIndexes.filter(index => 
            !indexes.some(i => i.name === index)
        );

        if (missingIndexes.length > 0) {
            return {
                valid: false,
                error: `Missing required indexes: ${missingIndexes.join(', ')}`
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: `Error checking index integrity: ${error.message}`
        };
    }
}

// Database optimization functions
function createIndexes() {
    try {
        // Create indexes for user_components table
        db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_user_components_type 
            ON user_components(component_type)
        `).run();

        db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_user_components_starter_id 
            ON user_components(original_starter_id)
        `).run();

        db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_user_components_created 
            ON user_components(created_at)
        `).run();

        db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_user_components_modified 
            ON user_components(modified_at)
        `).run();

        // Create composite index for common queries
        db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_user_components_type_active 
            ON user_components(component_type, is_active)
        `).run();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: `Error creating indexes: ${error.message}`
        };
    }
}

// Run all integrity checks
function runIntegrityChecks() {
    const results = {
        tableStructure: checkTableStructure(),
        dataIntegrity: checkDataIntegrity(),
        indexIntegrity: checkIndexIntegrity()
    };

    const allValid = Object.values(results).every(check => check.valid);
    const errors = Object.entries(results)
        .filter(([_, check]) => !check.valid)
        .map(([check, result]) => `${check}: ${result.error}`);

    return {
        valid: allValid,
        results,
        errors: errors.length > 0 ? errors : null
    };
}

// Optimize database
function optimizeDatabase() {
    try {
        // Run VACUUM to optimize storage
        db.prepare('VACUUM').run();
        
        // Create/update indexes
        const indexResult = createIndexes();
        if (!indexResult.success) {
            return indexResult;
        }

        // Analyze tables for better query planning
        db.prepare('ANALYZE').run();

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: `Error optimizing database: ${error.message}`
        };
    }
}

module.exports = {
    runIntegrityChecks,
    optimizeDatabase,
    checkTableStructure,
    checkDataIntegrity,
    checkIndexIntegrity,
    createIndexes
}; 