const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Human-readable SQL logging function
function logSQL(sql) {
    const cleanSQL = sql.trim();
    
    if (cleanSQL.includes('SELECT')) {
        // Parse SELECT queries for details
        if (cleanSQL.includes('component_types')) {
            if (cleanSQL.includes('COUNT(*)')) {
                console.log('[DB] Counting component types...');
            } else {
                console.log('[DB] Loading component types (id, type_key, display_name)...');
            }
        } else if (cleanSQL.includes('user_components') && cleanSQL.includes('JOIN component_types')) {
            console.log('[DB] Loading user components with type info (full component data)...');
        } else if (cleanSQL.includes('prompt_sets')) {
            console.log('[DB] Loading prompt sets (id, set_key, display_name)...');
        } else if (cleanSQL.includes('prompt_set_component_visibility')) {
            console.log('[DB] Loading prompt set visibility settings...');
        } else if (cleanSQL.includes('user_components')) {
            if (cleanSQL.includes('COUNT(*)')) {
                console.log('[DB] Counting user components...');
            } else if (cleanSQL.includes('WHERE id = ?')) {
                console.log('[DB] Loading specific user component by ID...');
            } else {
                console.log('[DB] Querying user components table...');
            }
        } else if (cleanSQL.includes('sqlite_master')) {
            console.log('[DB] Checking database schema/tables...');
        } else if (cleanSQL.includes('migrations')) {
            console.log('[DB] Checking migration status...');
        } else {
            console.log('[DB] Reading data from database...');
        }
    } else if (cleanSQL.includes('UPDATE')) {
        // Parse UPDATE queries with detailed extraction
        if (cleanSQL.includes('user_components')) {
            // Extract field being updated
            let field = 'unknown field';
            let idInfo = '';
            
            if (cleanSQL.includes('prompt_value =')) {
                field = 'prompt_value';
            } else if (cleanSQL.includes('is_active =')) {
                field = 'is_active (toggle)';
            } else if (cleanSQL.includes('selection =')) {
                field = 'selection';
            } else if (cleanSQL.includes('user_value =')) {
                field = 'user_value';
            } else if (cleanSQL.includes('modified_at =')) {
                field = 'timestamp';
            }
            
            // Try to extract the ID from WHERE clause
            const whereMatch = cleanSQL.match(/WHERE id = (\?|\d+)/i);
            if (whereMatch) {
                idInfo = whereMatch[1] === '?' ? ' (ID from parameter)' : ` #${whereMatch[1]}`;
            }
            
            console.log(`[DB] ✏️  Updating user_components${idInfo}: ${field}`);
            
        } else if (cleanSQL.includes('component_types')) {
            // Extract component type info
            let field = 'unknown field';
            let whereInfo = '';
            
            if (cleanSQL.includes('display_name =')) {
                field = 'display_name';
            }
            
            const typeMatch = cleanSQL.match(/WHERE type_key = ['"]?(\w+)['"]?/i);
            if (typeMatch) {
                whereInfo = ` (type: ${typeMatch[1]})`;
            }
            
            console.log(`[DB] ✏️  Updating component_types${whereInfo}: ${field}`);
            
        } else {
            // Extract table name for unknown updates
            const tableMatch = cleanSQL.match(/UPDATE (\w+)/i);
            const tableName = tableMatch ? tableMatch[1] : 'unknown_table';
            
            console.log(`[DB] ✏️  Updating ${tableName} record...`);
        }
         } else if (cleanSQL.includes('INSERT')) {
        // Parse INSERT queries with details
        if (cleanSQL.includes('user_components')) {
            // Try to extract component type info
            const valuesMatch = cleanSQL.match(/VALUES\s*\([^)]+\)/i);
            if (valuesMatch) {
                console.log('[DB] ➕ Creating new user_components record (with parameters)...');
            } else {
                console.log('[DB] ➕ Creating new user_components record...');
            }
        } else if (cleanSQL.includes('component_types')) {
            console.log('[DB] ➕ Creating new component_types record...');
        } else if (cleanSQL.includes('migrations')) {
            // Extract migration name if possible
            const nameMatch = cleanSQL.match(/VALUES\s*\([^,]*,\s*['"]([^'"]+)['"]/i);
            const migrationName = nameMatch ? nameMatch[1] : 'unknown';
            console.log(`[DB] ➕ Recording migration: ${migrationName}...`);
        } else {
            // Extract table name
            const tableMatch = cleanSQL.match(/INSERT INTO (\w+)/i);
            const tableName = tableMatch ? tableMatch[1] : 'unknown_table';
            console.log(`[DB] ➕ Creating new ${tableName} record...`);
        }
    } else if (cleanSQL.includes('DELETE')) {
        // Parse DELETE queries
        if (cleanSQL.includes('user_components')) {
            console.log('[DB] 🗑️  Deleting user component...');
        } else {
            console.log('[DB] 🗑️  Deleting database record...');
        }
    } else if (cleanSQL.includes('CREATE TABLE')) {
        console.log('[DB] 🔨 Creating database table...');
    } else if (cleanSQL.includes('ALTER TABLE')) {
        console.log('[DB] 🔨 Modifying table structure...');
    } else if (cleanSQL.includes('DROP')) {
        console.log('[DB] 🔨 Dropping database object...');
    } else if (cleanSQL.includes('PRAGMA')) {
        console.log('[DB] ⚙️  Setting database configuration...');
    } else if (cleanSQL.includes('BEGIN') || cleanSQL.includes('COMMIT') || cleanSQL.includes('ROLLBACK')) {
        console.log('[DB] 📦 Managing transaction...');
    } else {
        console.log(`[DB] Executing SQL: ${cleanSQL.substring(0, 50)}...`);
    }
}

// Initialize database
const db = new Database(path.join(dataDir, 'promptgen.db'), {
    verbose: logSQL
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create migrations table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`).run();

module.exports = db;
module.exports.logSQL = logSQL; 